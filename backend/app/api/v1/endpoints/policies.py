from datetime import datetime, timedelta, timezone
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from prisma.models import User

logger = logging.getLogger(__name__)

from app.api.deps import get_db, get_current_user
from app.schemas.policy import PolicyCreate, PolicyRead, PolicyCancel
from app.services.insurance_api import get_insurance_service
from app.services.escrow import get_escrow_service
from app.services import email_service as mail
from app.services.activity_log import log_activity

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.post("/", response_model=PolicyRead, status_code=status.HTTP_201_CREATED)
async def create_policy(
    body: PolicyCreate,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Activate a policy after on-chain premium payment is confirmed.

    Steps:
    1. Verify the Solana premium tx via the escrow service.
    2. Notify the insurance provider (issue_policy).
    3. Persist the Policy record.
    """
    quote = await db.quote.find_unique(where={"id": body.quoteId}, include={"user": True})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found.")
    if quote.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    if quote.status != "pending":
        raise HTTPException(status_code=409, detail=f"Quote is already '{quote.status}'.")
    if await db.policy.find_unique(where={"quoteId": body.quoteId}):
        raise HTTPException(status_code=409, detail="Policy already exists for this quote.")

    try:
        escrow_svc = get_escrow_service()
        verification = await escrow_svc.verify_premium_tx(
            tx_hash=body.premiumTxHash,
            expected_amount=quote.premiumAmount,
            currency=quote.currency,
        )
        if not verification.valid:
            raise HTTPException(status_code=400, detail=f"Premium tx invalid: {verification.message}")

        insurance_svc = get_insurance_service()
        issued = await insurance_svc.issue_policy(
            quote_ref=quote.insuranceRef or quote.id,
            premium_tx_hash=body.premiumTxHash,
            escrow_account=verification.pda,
        )

        now = datetime.now(timezone.utc)

        # Monthly premium from body (defaults to 1/12 of total if not supplied)
        monthly_premium = body.monthlyPremium if body.monthlyPremium is not None else round(quote.premiumAmount / 12, 4)
        duration_months = body.durationMonths if body.durationMonths is not None else 12
        # Next payment is due 30 days after activation
        next_payment_due = now + timedelta(days=30)

        policy = await db.policy.create(
            data={
                "userId": quote.userId,
                "quoteId": quote.id,
                "productType": quote.productType,
                "coverageAmount": quote.coverageAmount,
                "premiumAmount": quote.premiumAmount,
                "currency": quote.currency,
                "endDate": now + timedelta(days=365),
                "premiumTxHash": body.premiumTxHash,
                "escrowAccount": body.escrowAccount or verification.pda,
                "insuranceRef": issued.ref,
                # On-chain monthly payment fields
                "monthlyPremium": monthly_premium,
                "durationMonths": duration_months,
                "paymentsCount": 1,           # first payment just made on-chain
                "nextPaymentDue": next_payment_due,
            }
        )

        # Mark the quote as accepted
        await db.quote.update(where={"id": quote.id}, data={"status": "accepted"})

        # Notify user and log
        await log_activity(
            db=db, actor=current_user.wallet, actor_role="user",
            action="policy.created",
            target_id=policy.id, target_type="policy",
            metadata={"productType": quote.productType, "coverageAmount": quote.coverageAmount, "txHash": body.premiumTxHash},
        )
        if current_user.email:
            await mail.send_policy_created(
                current_user.email, current_user.wallet,
                quote.productType, quote.coverageAmount, monthly_premium, body.premiumTxHash,
            )

        return policy

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("create_policy failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Policy creation failed: {exc}",
        ) from exc


@router.get("/me", response_model=list[PolicyRead])
async def list_my_policies(
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all policies for the authenticated user."""
    return await db.policy.find_many(
        where={"userId": current_user.id},
        order={"createdAt": "desc"},
    )


@router.get("/{policy_id}", response_model=PolicyRead)
async def get_policy(
    policy_id: str,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    policy = await db.policy.find_unique(where={"id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    if policy.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return policy


@router.patch("/{policy_id}/cancel", response_model=PolicyRead)
async def cancel_policy(
    policy_id: str,
    body: PolicyCancel,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel an active policy.
    In a full implementation this would also trigger a pro-rata escrow refund.
    """
    policy = await db.policy.find_unique(where={"id": policy_id}, include={"user": True})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    if policy.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    if policy.status != "active":
        raise HTTPException(status_code=409, detail=f"Policy is already '{policy.status}'.")

    updated = await db.policy.update(
        where={"id": policy_id},
        data={"status": "cancelled"},
    )
    await log_activity(
        db=db, actor=current_user.wallet, actor_role="user",
        action="policy.cancelled",
        target_id=policy_id, target_type="policy",
        metadata={"reason": getattr(body, 'reason', None)},
    )
    if current_user.email:
        await mail.send_policy_status_changed(current_user.email, current_user.wallet, policy.productType, "cancelled")
    return updated


# ---------------------------------------------------------------------------
# Premium payment history
# ---------------------------------------------------------------------------

@router.get("/{policy_id}/payments")
async def list_premium_payments(
    policy_id: str,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return the full on-chain premium payment history for a policy,
    including failed attempts (so the UI can surface payment failures).
    """
    policy = await db.policy.find_unique(where={"id": policy_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    if policy.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    payments = await db.premiumpayment.find_many(
        where={"policyId": policy_id},
        order={"createdAt": "desc"},
    )
    return payments
