"""
IRIS Protocol — JWT + Solana wallet-signature security utilities.
"""

import base64
import secrets
from datetime import datetime, timedelta, timezone

import base58
import nacl.exceptions
import nacl.signing
from jose import JWTError, jwt

from app.core.config import settings

# ── Nonce ──────────────────────────────────────────────────────────────────────

NONCE_TTL_SECONDS = 300  # 5 minutes


def create_nonce() -> str:
    """Generate a cryptographically-random 32-byte hex nonce."""
    return secrets.token_hex(32)


def nonce_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(seconds=NONCE_TTL_SECONDS)


def build_sign_message(nonce: str) -> str:
    """
    Returns the human-readable message the wallet must sign.
    Wallets display this to the user — keep it clear and honest.
    """
    return (
        "Sign in to IRIS Protocol\n\n"
        f"Nonce: {nonce}\n\n"
        "This request will not trigger a blockchain transaction "
        "or cost any gas fees."
    )


# ── Signature verification ─────────────────────────────────────────────────────

def verify_wallet_signature(wallet: str, message: str, signature_b64: str) -> bool:
    """
    Verify a Solana Ed25519 signature.

    - wallet        : base58-encoded Solana public key
    - message       : the plain-text string that was signed
    - signature_b64 : base64-encoded 64-byte Ed25519 signature
    """
    try:
        pubkey_bytes = base58.b58decode(wallet)
        sig_bytes = base64.b64decode(signature_b64)
        verify_key = nacl.signing.VerifyKey(pubkey_bytes)
        verify_key.verify(message.encode("utf-8"), sig_bytes)
        return True
    except (nacl.exceptions.BadSignatureError, Exception):
        return False


# ── JWT ────────────────────────────────────────────────────────────────────────

def _encode(payload: dict) -> str:
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return _encode({"sub": user_id, "exp": expire, "type": "access"})


def create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    return _encode({"sub": user_id, "exp": expire, "type": "refresh"})


def decode_access_token(token: str) -> str:
    """Decode an access JWT and return the user_id (sub). Raises JWTError on failure."""
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != "access":
        raise JWTError("Not an access token.")
    sub: str | None = payload.get("sub")
    if not sub:
        raise JWTError("Missing sub.")
    return sub


def decode_refresh_token(token: str) -> str:
    """Decode a refresh JWT and return the user_id. Raises JWTError on failure."""
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != "refresh":
        raise JWTError("Not a refresh token.")
    sub: str | None = payload.get("sub")
    if not sub:
        raise JWTError("Missing sub.")
    return sub
