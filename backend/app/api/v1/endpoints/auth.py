"""
IRIS Protocol — Wallet-based authentication endpoints.

Flow:
  1. POST /auth/challenge  { wallet }
       → creates/upserts User, stores nonce, returns { nonce, message }
  2. POST /auth/verify     { wallet, nonce, signature }
       → verifies Ed25519 sig, issues access + refresh JWTs
  3. POST /auth/refresh    { refresh_token }
       → issues new access + refresh JWTs (rotation)
"""

from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from pydantic import BaseModel

from app.api.deps import get_db
from app.core.security import (
    build_sign_message,
    create_access_token,
    create_nonce,
    create_refresh_token,
    decode_refresh_token,
    nonce_expires_at,
    verify_wallet_signature,
)
from app.schemas.user import UserRead
from app.services import email_service as mail
from app.services.activity_log import log_activity

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Request / Response schemas ─────────────────────────────────────────────────

class ChallengeRequest(BaseModel):
    wallet: str


class ChallengeResponse(BaseModel):
    nonce: str
    message: str


class VerifyRequest(BaseModel):
    wallet: str
    nonce: str
    signature: str   # base64-encoded Ed25519 signature


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/challenge", response_model=ChallengeResponse)
async def challenge(body: ChallengeRequest, db: Prisma = Depends(get_db)):
    """
    Step 1 — Issue a one-time sign challenge for the given wallet.
    Creates a User record if one does not already exist.
    """
    nonce = create_nonce()
    expires = nonce_expires_at()
    message = build_sign_message(nonce)

    # Upsert: create user if new, otherwise just refresh the nonce
    existing = await db.user.find_unique(where={"wallet": body.wallet})
    if existing:
        await db.user.update(
            where={"wallet": body.wallet},
            data={"nonce": nonce, "nonceExpiresAt": expires},
        )
    else:
        await db.user.create(
            data={
                "wallet": body.wallet,
                "nonce": nonce,
                "nonceExpiresAt": expires,
            }
        )

    return ChallengeResponse(nonce=nonce, message=message)


@router.post("/verify", response_model=AuthResponse)
async def verify(body: VerifyRequest, db: Prisma = Depends(get_db)):
    """
    Step 2 — Verify the signed nonce and issue JWTs.
    """
    from datetime import datetime

    user = await db.user.find_unique(where={"wallet": body.wallet})
    if not user:
        raise HTTPException(status_code=404, detail="Wallet not found. Request a challenge first.")

    # Nonce match
    if user.nonce != body.nonce:
        raise HTTPException(status_code=401, detail="Nonce mismatch.")

    # Nonce expiry
    if user.nonceExpiresAt and user.nonceExpiresAt.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Nonce expired. Request a new challenge.")

    # Signature verification
    message = build_sign_message(body.nonce)
    if not verify_wallet_signature(body.wallet, message, body.signature):
        raise HTTPException(status_code=401, detail="Invalid signature.")

    # Invalidate nonce after successful use and copy email from waitlist if not set
    update_data: dict = {"nonce": None, "nonceExpiresAt": None}
    if not user.email:
        waitlist_entry = await db.waitlist.find_unique(where={"wallet": body.wallet})
        if waitlist_entry and waitlist_entry.email:
            update_data["email"] = waitlist_entry.email

    updated_user = await db.user.update(
        where={"wallet": body.wallet},
        data=update_data,
    )

    # Welcome email for brand-new users
    is_new = not user.email and update_data.get("email")
    if is_new and updated_user.email:
        await mail.send_welcome(updated_user.email, updated_user.wallet)

    # Log sign-in
    await log_activity(
        db=db, actor=updated_user.wallet, actor_role=updated_user.role,
        action="user.signed_in",
        target_id=updated_user.id, target_type="user",
    )

    return AuthResponse(
        access_token=create_access_token(updated_user.id),
        refresh_token=create_refresh_token(updated_user.id),
        user=UserRead.model_validate(updated_user),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(body: RefreshRequest, db: Prisma = Depends(get_db)):
    """
    Step 3 — Exchange a valid refresh token for a new access + refresh pair.
    """
    from jose import JWTError

    try:
        user_id = decode_refresh_token(body.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    return RefreshResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )
