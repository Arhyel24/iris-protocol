from datetime import datetime, timezone
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

from app.api.deps import get_db, get_current_user
from app.schemas.claim import ClaimCreate, ClaimRead, ClaimReview
from app.services.insurance_api import get_insurance_service
from app.services.escrow import get_escrow_service
from app.core.solana_client import (
    oracle_trigger_payout,
    derive_treasury_pda,
)
from app.services import email_service as mail
from app.services.activity_log import log_activity
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/claims", tags=["Claims"])


@router.post("/", response_model=ClaimRead, status_code=status.HTTP_201_CREATED)
async def file_claim(
    body: ClaimCreate,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """File a new claim against an active policy."""
    policy = await db.policy.find_unique(
        where={"id": body.policyId},
        include={"user": True},
    )
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    if policy.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    if policy.status != "active":
        raise HTTPException(status_code=409, detail=f"Policy is '{policy.status}', not active.")

    claim = await db.claim.create(
        data={
            "policyId": body.policyId,
            "description": body.description,
            "incidentDate": body.incidentDate,
            "proofHash": body.proofHash,
        }
    )
    await log_activity(
        db=db, actor=current_user.wallet, actor_role="user",
        action="claim.filed",
        target_id=claim.id, target_type="claim",
        metadata={"policyId": body.policyId, "productType": policy.productType, "coverage": policy.coverageAmount},
    )
    if current_user.email:
        await mail.send_claim_submitted(
            current_user.email, current_user.wallet,
            claim.id, policy.productType, policy.coverageAmount,
        )
    return claim


@router.get("/me", response_model=list[ClaimRead])
async def list_my_claims(
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all claims for the authenticated user (across all their policies)."""
    policies = await db.policy.find_many(where={"userId": current_user.id}, include={"claims": True})
    claims = []
    for p in policies:
        if p.claims:
            claims.extend(p.claims)
    claims.sort(key=lambda c: c.createdAt, reverse=True)
    return claims


@router.get("/{claim_id}", response_model=ClaimRead)
async def get_claim(
    claim_id: str,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    claim = await db.claim.find_unique(where={"id": claim_id}, include={"policy": True})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    if claim.policy.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return claim


@router.get("/policy/{policy_id}", response_model=list[ClaimRead])
async def list_policy_claims(
    policy_id: str,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    policy = await db.policy.find_unique(where={"id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    if policy.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return await db.claim.find_many(
        where={"policyId": policy_id},
        order={"createdAt": "desc"},
    )


@router.patch("/{claim_id}/review", response_model=ClaimRead)
async def review_claim(claim_id: str, body: ClaimReview, db: Prisma = Depends(get_db), _: User = Depends(get_current_user)):
    """
    [Admin] Approve or reject a claim.

    On approval:
    - Calls the insurance API to validate the claim.
    - Releases the escrow payout to the user's Solana wallet.
    - Records the payout tx hash on the claim.
    """
    if body.decision not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Decision must be 'approved' or 'rejected'.")

    claim = await db.claim.find_unique(
        where={"id": claim_id},
        include={"policy": {"include": {"user": True}}},
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    if claim.status != "pending":
        raise HTTPException(status_code=409, detail=f"Claim is already '{claim.status}'.")

    if body.decision == "rejected":
        return await db.claim.update(
            where={"id": claim_id},
            data={
                "status": "rejected",
                "reviewNote": body.reviewNote,
                "reviewedAt": datetime.now(timezone.utc),
            },
        )

    # --- Approve path ---
    if body.payoutAmount is None:
        raise HTTPException(status_code=400, detail="payoutAmount is required when approving.")

    # 1. Validate with insurance API
    insurance_svc = get_insurance_service()
    result = await insurance_svc.validate_claim(
        policy_ref=claim.policy.insuranceRef or claim.policyId,
        description=claim.description,
        incident_date=claim.incidentDate,
        proof_hash=claim.proofHash,
    )
    if not result.approved:
        raise HTTPException(status_code=422, detail=f"Insurance API rejected claim: {result.note}")

    # 2. Release payout on-chain via oracle (primary path)
    on_chain_tx: str | None = None
    policy = claim.policy
    if policy.escrowAccount:
        try:
            treasury_admin_pubkey: str | None = None
            if settings.ORACLE_PRIVATE_KEY_B58:
                import base58 as _base58
                from solders.keypair import Keypair
                raw = _base58.b58decode(settings.ORACLE_PRIVATE_KEY_B58)
                kp = Keypair.from_bytes(raw)
                treasury_admin_pubkey = str(kp.pubkey())

            if treasury_admin_pubkey:
                treasury_pda, _ = derive_treasury_pda(
                    settings.IRIS_PROGRAM_ID, treasury_admin_pubkey
                )
                # payout index = number of existing payouts already recorded
                payout_index = await db.claim.count(
                    where={"policyId": policy.id, "status": "paid"}
                )
                payout_record_pda = derive_payout_record_pda(
                    settings.IRIS_PROGRAM_ID,
                    policy.escrowAccount,
                    payout_index,
                )
                user_usdc = getattr(policy, "userUsdcAccount", None) or ""
                treasury_usdc = getattr(policy, "treasuryUsdcAccount", None) or ""

                # Convert to USDC micro-units (6 decimals)
                payout_lamports = int(body.payoutAmount * 1_000_000)

                on_chain_tx = await oracle_trigger_payout(
                    policy_pda=policy.escrowAccount,
                    treasury_pda=treasury_pda,
                    user_usdc_account=user_usdc,
                    treasury_usdc_account=treasury_usdc,
                    claim_id=claim_id[:32],   # anchor String limited to 32 chars
                    payout_amount_lamports=payout_lamports,
                    payout_index=payout_index,
                    payout_record_pda=payout_record_pda,
                )
                if on_chain_tx:
                    logger.info("On-chain payout tx: %s", on_chain_tx)
                else:
                    logger.error(
                        "oracle_trigger_payout returned None for claim %s — falling back to legacy escrow.",
                        claim_id,
                    )
        except Exception as exc:
            logger.exception("On-chain payout failed for claim %s: %s", claim_id, exc)

    # 3. Legacy escrow fallback (if on-chain call unavailable / failed)
    payout_tx_hash = on_chain_tx
    if not payout_tx_hash:
        escrow_svc = get_escrow_service()
        payout = await escrow_svc.release_payout(
            escrow_pda=policy.escrowAccount or "",
            recipient_wallet=policy.user.wallet,
            amount=body.payoutAmount,
            currency=policy.currency,
        )
        if not payout.success:
            raise HTTPException(status_code=500, detail=f"Escrow release failed: {payout.message}")
        payout_tx_hash = payout.tx_hash

    return await db.claim.update(
        where={"id": claim_id},
        data={
            "status": "paid",
            "payoutAmount": body.payoutAmount,
            "payoutTxHash": payout_tx_hash,
            "reviewNote": body.reviewNote or result.note,
            "reviewedAt": datetime.now(timezone.utc),
        },
    )
