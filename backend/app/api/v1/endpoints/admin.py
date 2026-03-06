"""
IRIS Protocol — Admin Endpoints
================================
All routes require a valid JWT *and* role == 'admin'.
The router is mounted at an intentionally obscure prefix (see router.py).
Non-admins receive 403 with a vague message to avoid leaking path existence.

New in this version:
- Email OTP gate before portal access
- Claim approval requires admin wallet signature
- Activity logging on every state-changing action
- User email notifications on all actions
- Chain/wallet status endpoint
- Activity log query endpoint
"""

import random
import string
from datetime import datetime, timedelta, timezone
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from prisma import Prisma
from prisma.models import User

from app.api.deps import get_db, get_current_admin
from app.schemas.admin import (
    AdminStats,
    AdminUserRead,
    AdminPolicyRead,
    AdminClaimRead,
    AdminClaimReview,
    AdminUserRoleUpdate,
    OTPRequest,
    OTPVerify,
    OTPResponse,
    ChainStatus,
    ActivityLogEntry,
)
from app.services.insurance_api import get_insurance_service
from app.services import email_service as mail
from app.services.activity_log import log_activity
from app.core.solana_client import (
    oracle_trigger_payout,
    derive_treasury_pda,
    get_oracle_sol_balance,
    get_usdc_ata_balance,
)
from app.core.security import verify_wallet_signature
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Admin"])

OTP_TTL_MINUTES = 10
OTP_ACTION_MESSAGE = "IRIS Admin Action Authorization"


# ─── OTP — email-based pre-auth for portal access ─────────────────────────────

@router.post("/otp/request", response_model=OTPResponse)
async def admin_otp_request(
    body: OTPRequest,
    db: Prisma = Depends(get_db),
):
    """
    Step 1 of admin portal login.
    Verifies the wallet belongs to an admin, sends OTP to their registered email.
    """
    user = await db.user.find_unique(where={"wallet": body.wallet})
    if not user or user.role != "admin":
        raise HTTPException(status_code=404, detail="Not found.")
    if not user.email:
        raise HTTPException(
            status_code=422,
            detail="No email registered for this admin wallet. Contact the super-admin.",
        )

    code = "".join(random.choices(string.digits, k=6))
    expires = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    # Strip tz-info: the column is TIMESTAMP WITHOUT TIME ZONE
    expires_naive = expires.replace(tzinfo=None)

    await db.execute_raw(
        'UPDATE "AdminOTP" SET used = true WHERE wallet = $1 AND used = false',
        body.wallet,
    )
    await db.execute_raw(
        'INSERT INTO "AdminOTP" (id, email, wallet, code, used, "expiresAt") '
        'VALUES (gen_random_uuid()::text, $1, $2, $3, false, $4::TIMESTAMP)',
        user.email, body.wallet, code, expires_naive.isoformat(),
    )

    await mail.send_admin_otp(user.email, code, body.wallet)
    logger.info("Admin OTP sent to %s for wallet %s", user.email, body.wallet)

    masked = user.email[:3] + "***@" + user.email.split("@")[1]
    return OTPResponse(ok=True, message=f"OTP sent to {masked}")


@router.post("/otp/verify", response_model=OTPResponse)
async def admin_otp_verify(
    body: OTPVerify,
    db: Prisma = Depends(get_db),
):
    """Verify the OTP. The frontend stores a 'otpVerified' flag in session."""
    rows = await db.query_raw(
        'SELECT id, code, used, "expiresAt" FROM "AdminOTP" '
        'WHERE wallet = $1 AND used = false ORDER BY "createdAt" DESC LIMIT 1',
        body.wallet,
    )
    if not rows:
        raise HTTPException(status_code=401, detail="No pending OTP. Request a new one.")
    row = rows[0]
    expires_at = row["expiresAt"]
    if isinstance(expires_at, str):
        # DB returns naive ISO string; parse as naive UTC
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "").replace("+00:00", ""))
    elif hasattr(expires_at, 'tzinfo') and expires_at.tzinfo is not None:
        expires_at = expires_at.replace(tzinfo=None)
    # Compare naive datetimes (both UTC)
    if expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="OTP expired. Request a new one.")
    if row["code"] != body.code:
        raise HTTPException(status_code=401, detail="Incorrect OTP.")

    await db.execute_raw(
        'UPDATE "AdminOTP" SET used = true WHERE id = $1',
        row["id"],
    )
    await log_activity(db=db, actor=body.wallet, actor_role="admin", action="admin.otp.verified")
    return OTPResponse(ok=True, message="OTP verified. Access granted.")


# ─── Chain / Wallet Status ────────────────────────────────────────────────────

@router.get("/chain-status", response_model=ChainStatus)
async def admin_chain_status(
    _: User = Depends(get_current_admin),
):
    """Live on-chain data: oracle SOL balance, treasury USDC, program ID."""
    rpc_url = settings.HELIUS_RPC_URL if settings.HELIUS_API_KEY else "https://api.devnet.solana.com"
    sol_balance = await get_oracle_sol_balance(settings.ORACLE_PUBKEY, rpc_url)
    usdc_balance = await get_usdc_ata_balance(settings.TREASURY_USDC_ATA, rpc_url)
    return ChainStatus(
        oracleWallet=settings.ORACLE_PUBKEY,
        oracleSolBalance=sol_balance,
        treasuryPda=settings.TREASURY_PDA,
        treasuryUsdcBalance=usdc_balance,
        programId=settings.IRIS_PROGRAM_ID,
        cluster=settings.HELIUS_CLUSTER,
    )


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStats)
async def admin_stats(
    db: Prisma = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    users      = await db.user.count()
    policies   = await db.policy.find_many()
    claims     = await db.claim.find_many()

    active     = sum(1 for p in policies if p.status == "active")
    pending_c  = sum(1 for c in claims if c.status == "pending")
    approved_c = sum(1 for c in claims if c.status in ("approved", "paid"))
    rejected_c = sum(1 for c in claims if c.status == "rejected")
    total_prem = sum(p.premiumAmount for p in policies)

    return AdminStats(
        totalUsers=users,
        totalPolicies=len(policies),
        activePolicies=active,
        pendingClaims=pending_c,
        approvedClaims=approved_c,
        rejectedClaims=rejected_c,
        totalPremiumCollected=round(total_prem, 4),
    )


# ─── Activity Log ─────────────────────────────────────────────────────────────

@router.get("/activity", response_model=list[ActivityLogEntry])
async def admin_activity_log(
    limit: int = 100,
    offset: int = 0,
    action_filter: str | None = None,
    db: Prisma = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    if action_filter:
        rows = await db.query_raw(
            'SELECT * FROM "ActivityLog" WHERE action LIKE $1 '
            'ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
            f"{action_filter}%", limit, offset,
        )
    else:
        rows = await db.query_raw(
            'SELECT * FROM "ActivityLog" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2',
            limit, offset,
        )
    return [
        ActivityLogEntry(
            id=r["id"], actor=r["actor"], actorRole=r["actorRole"],
            action=r["action"], targetId=r.get("targetId"),
            targetType=r.get("targetType"), metadata=r.get("metadata"),
            ipAddress=r.get("ipAddress"), createdAt=r["createdAt"],
        )
        for r in rows
    ]


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[AdminUserRead])
async def admin_list_users(
    db: Prisma = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    users = await db.user.find_many(
        include={"policies": True},
        order={"createdAt": "desc"},
    )
    result = []
    for u in users:
        claim_count = 0
        if u.policies:
            for p in u.policies:
                claim_count += await db.claim.count(where={"policyId": p.id})
        result.append(AdminUserRead(
            id=u.id, wallet=u.wallet, email=u.email,
            role=u.role, createdAt=u.createdAt,
            policyCount=len(u.policies) if u.policies else 0,
            claimCount=claim_count,
        ))
    return result


@router.patch("/users/{user_id}/role", response_model=AdminUserRead)
async def admin_set_user_role(
    user_id: str,
    body: AdminUserRoleUpdate,
    request: Request,
    db: Prisma = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if body.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="role must be 'user' or 'admin'.")
    if user_id == current_admin.id and body.role != "admin":
        raise HTTPException(status_code=400, detail="Cannot demote yourself.")

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_role = user.role
    updated = await db.user.update(where={"id": user_id}, data={"role": body.role})
    policies = await db.policy.find_many(where={"userId": user_id})
    claim_count = 0
    for p in policies:
        claim_count += await db.claim.count(where={"policyId": p.id})

    await log_activity(
        db=db, actor=current_admin.wallet, actor_role="admin",
        action="user.role.changed",
        target_id=user_id, target_type="user",
        metadata={"oldRole": old_role, "newRole": body.role, "targetWallet": user.wallet},
        ip_address=request.client.host if request.client else None,
    )
    if updated.email:
        await mail.send_user_role_changed(updated.email, updated.wallet, body.role)

    return AdminUserRead(
        id=updated.id, wallet=updated.wallet, email=updated.email,
        role=updated.role, createdAt=updated.createdAt,
        policyCount=len(policies), claimCount=claim_count,
    )


# ─── Policies ─────────────────────────────────────────────────────────────────

@router.get("/policies", response_model=list[AdminPolicyRead])
async def admin_list_policies(
    db: Prisma = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    policies = await db.policy.find_many(
        include={"user": True},
        order={"createdAt": "desc"},
    )
    return [
        AdminPolicyRead(
            id=p.id, userId=p.userId,
            userWallet=p.user.wallet if p.user else "",
            userEmail=p.user.email if p.user else None,
            quoteId=p.quoteId, productType=p.productType,
            coverageAmount=p.coverageAmount, premiumAmount=p.premiumAmount,
            monthlyPremium=p.monthlyPremium, durationMonths=p.durationMonths,
            paymentsCount=p.paymentsCount, nextPaymentDue=p.nextPaymentDue,
            currency=p.currency, status=p.status,
            startDate=p.startDate, endDate=p.endDate,
            premiumTxHash=p.premiumTxHash, escrowAccount=p.escrowAccount,
            insuranceRef=p.insuranceRef, createdAt=p.createdAt,
        )
        for p in policies
    ]


@router.patch("/policies/{policy_id}/status")
async def admin_set_policy_status(
    policy_id: str,
    body: dict,
    request: Request,
    db: Prisma = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    allowed = ("active", "expired", "cancelled")
    new_status = body.get("status", "")
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"status must be one of {allowed}.")

    policy = await db.policy.find_unique(
        where={"id": policy_id},
        include={"user": True},
    )
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")

    old_status = policy.status
    updated = await db.policy.update(where={"id": policy_id}, data={"status": new_status})

    await log_activity(
        db=db, actor=current_admin.wallet, actor_role="admin",
        action="policy.status.changed",
        target_id=policy_id, target_type="policy",
        metadata={"oldStatus": old_status, "newStatus": new_status, "productType": policy.productType},
        ip_address=request.client.host if request.client else None,
    )
    if policy.user and policy.user.email:
        await mail.send_policy_status_changed(policy.user.email, policy.user.wallet, policy.productType, new_status)

    return updated


# ─── Claims ───────────────────────────────────────────────────────────────────

@router.get("/claims", response_model=list[AdminClaimRead])
async def admin_list_claims(
    status_filter: str | None = None,
    db: Prisma = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    where = {}
    if status_filter:
        where["status"] = status_filter

    claims = await db.claim.find_many(
        where=where,
        include={"policy": {"include": {"user": True}}},
        order={"createdAt": "desc"},
    )
    result = []
    for c in claims:
        p = c.policy
        u = p.user if p else None
        result.append(_claim_read(c, p, u))
    return result


@router.patch("/claims/{claim_id}/review", response_model=AdminClaimRead)
async def admin_review_claim(
    claim_id: str,
    body: AdminClaimReview,
    request: Request,
    db: Prisma = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """
    Approve or reject a claim.

    Admin wallet signature (body.adminSignature) is verified when provided.
    On approval: Oracle wallet triggers on-chain payout; claim → 'paid'.
    Email sent to user; action logged.
    """
    if body.decision not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="decision must be 'approved' or 'rejected'.")

    # ── Optional admin wallet signature verification ──────────────────────────
    if body.adminSignature:
        action_msg = f"{OTP_ACTION_MESSAGE}\nClaim: {claim_id}\nDecision: {body.decision}"
        if not verify_wallet_signature(current_admin.wallet, action_msg, body.adminSignature):
            raise HTTPException(status_code=401, detail="Admin wallet signature invalid.")

    claim = await db.claim.find_unique(
        where={"id": claim_id},
        include={"policy": {"include": {"user": True}}},
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    if claim.status != "pending":
        raise HTTPException(status_code=409, detail=f"Claim is already '{claim.status}'.")

    p = claim.policy
    u = p.user if p else None

    # ── Rejection ─────────────────────────────────────────────────────────────
    if body.decision == "rejected":
        updated = await db.claim.update(
            where={"id": claim_id},
            data={"status": "rejected", "reviewNote": body.reviewNote, "reviewedAt": datetime.now(timezone.utc)},
        )
        await log_activity(
            db=db, actor=current_admin.wallet, actor_role="admin",
            action="claim.rejected", target_id=claim_id, target_type="claim",
            metadata={"reviewNote": body.reviewNote, "userWallet": u.wallet if u else None},
            ip_address=request.client.host if request.client else None,
        )
        if u and u.email:
            await mail.send_claim_rejected(u.email, u.wallet, claim_id, body.reviewNote)
        return _claim_read(updated, p, u)

    # ── Approval ──────────────────────────────────────────────────────────────
    if body.payoutAmount is None:
        raise HTTPException(status_code=400, detail="payoutAmount required when approving.")

    # ── Pre-approval balance checks ───────────────────────────────────────────
    rpc_url = settings.HELIUS_RPC_URL if settings.HELIUS_API_KEY else "https://api.devnet.solana.com"

    treasury_usdc = await get_usdc_ata_balance(settings.TREASURY_USDC_ATA, rpc_url)
    if treasury_usdc < body.payoutAmount:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Insufficient treasury USDC balance. "
                f"Available: ${treasury_usdc:,.4f} USDC — "
                f"Required: ${body.payoutAmount:,.4f} USDC. "
                f"Top up the treasury before approving this claim."
            ),
        )

    oracle_sol = await get_oracle_sol_balance(settings.ORACLE_PUBKEY, rpc_url)
    MIN_SOL_FOR_FEES = 0.01  # ~10k lamports headroom for tx fees
    if oracle_sol < MIN_SOL_FOR_FEES:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Oracle wallet SOL balance too low to cover transaction fees. "
                f"Current: {oracle_sol:.6f} SOL — minimum required: {MIN_SOL_FOR_FEES} SOL. "
                f"Airdrop or transfer SOL to {settings.ORACLE_PUBKEY}."
            ),
        )

    insurance_svc = get_insurance_service()
    result = await insurance_svc.validate_claim(
        policy_ref=p.insuranceRef or claim.policyId if p else claim.policyId,
        description=claim.description,
        incident_date=claim.incidentDate,
        proof_hash=claim.proofHash,
    )
    if not result.approved:
        raise HTTPException(status_code=422, detail=f"Insurance API rejected: {result.note}")

    # On-chain trigger_payout via oracle wallet
    on_chain_tx: str | None = None
    if p and p.escrowAccount:
        try:
            import base58 as _b58
            from solders.keypair import Keypair
            raw = _b58.b58decode(settings.ORACLE_PRIVATE_KEY_B58)
            kp = Keypair.from_bytes(raw)
            treasury_pda, _ = derive_treasury_pda(settings.IRIS_PROGRAM_ID, str(kp.pubkey()))
            payout_index = await db.claim.count(where={"policyId": p.id, "status": "paid"})
            payout_lamports = int(body.payoutAmount * 1_000_000)

            on_chain_tx = await oracle_trigger_payout(
                policy_pda=p.escrowAccount,
                treasury_pda=treasury_pda,
                user_usdc_account=u.wallet if u else "",
                treasury_usdc_account=settings.TREASURY_USDC_ATA,
                claim_id=claim_id[:32],
                payout_amount_lamports=payout_lamports,
                payout_index=payout_index,
            )
            if on_chain_tx:
                logger.info("Payout tx: %s for claim %s", on_chain_tx, claim_id)
        except Exception as exc:
            logger.exception("On-chain payout failed for claim %s: %s", claim_id, exc)

    updated = await db.claim.update(
        where={"id": claim_id},
        data={
            "status": "paid",
            "payoutAmount": body.payoutAmount,
            "payoutTxHash": on_chain_tx,   # None if on-chain failed — no fake hashes
            "reviewNote": body.reviewNote or result.note,
            "reviewedAt": datetime.now(timezone.utc),
        },
    )

    await log_activity(
        db=db, actor=current_admin.wallet, actor_role="admin",
        action="claim.approved", target_id=claim_id, target_type="claim",
        metadata={
            "payoutAmount": body.payoutAmount,
            "payoutTxHash": on_chain_tx,
            "onChainSuccess": on_chain_tx is not None,
            "userWallet": u.wallet if u else None,
        },
        ip_address=request.client.host if request.client else None,
    )
    if u and u.email:
        await mail.send_claim_approved(
            u.email, u.wallet, claim_id,
            body.payoutAmount, on_chain_tx or "pending", body.reviewNote,
        )

    return _claim_read(updated, p, u)


def _claim_read(c, p, u) -> AdminClaimRead:
    return AdminClaimRead(
        id=c.id, policyId=c.policyId,
        userId=u.id if u else "", userWallet=u.wallet if u else "",
        userEmail=u.email if u else None,
        productType=p.productType if p else "", coverageAmount=p.coverageAmount if p else 0,
        status=c.status, description=c.description,
        incidentDate=c.incidentDate, proofHash=c.proofHash,
        payoutAmount=c.payoutAmount, payoutTxHash=c.payoutTxHash,
        reviewedAt=c.reviewedAt, reviewNote=c.reviewNote,
        escrowAccount=p.escrowAccount if p else None,
        createdAt=c.createdAt,
    )



