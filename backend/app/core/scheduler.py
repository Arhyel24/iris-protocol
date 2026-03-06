"""
IRIS Protocol — Premium Payment Scheduler
==========================================
Uses APScheduler to periodically:
  1. Find all active policies where next_payment_due <= now
  2. Call the Anchor `pay_monthly_premium` instruction for each via the oracle
  3. Record success/failure in the PremiumPayment table
  4. Find all policies past their expiry_timestamp and expire them on-chain

The scheduler runs inside the FastAPI lifespan and fires every
`PREMIUM_SCHEDULER_INTERVAL_MINUTES` minutes (default: 60).
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


async def collect_due_premiums() -> None:
    """
    Find all active policies where next_payment_due has passed and collect
    the monthly premium via the oracle.
    """
    try:
        from app.core.db import db
        from app.core.config import settings
        from app.core.solana_client import (
            oracle_pay_monthly_premium,
            derive_premium_record_pda,
        )

        now = datetime.now(timezone.utc)

        # Policies that are active AND have payments remaining AND it's time
        due_policies = await db.policy.find_many(
            where={
                "status": "active",
                "nextPaymentDue": {"lte": now},
                "escrowAccount": {"not": None},  # must have on-chain PDA to interact
            }
        )

        if not due_policies:
            logger.debug("Premium scheduler: no payments due.")
            return

        logger.info("Premium scheduler: %d payment(s) due.", len(due_policies))

        treasury_admin_pubkey: str | None = None
        try:
            import base58 as _base58
            from solders.keypair import Keypair

            if settings.ORACLE_PRIVATE_KEY_B58:
                raw = _base58.b58decode(settings.ORACLE_PRIVATE_KEY_B58)
                kp = Keypair.from_bytes(raw)
                treasury_admin_pubkey = str(kp.pubkey())
        except Exception:
            pass

        for policy in due_policies:
            if policy.escrowAccount is None:
                continue

            payment_index = policy.paymentsCount  # next expected index (0-based, already incremented)
            premium_record_pda = derive_premium_record_pda(
                settings.IRIS_PROGRAM_ID,
                policy.escrowAccount,
                payment_index,
            )

            # We need the user's USDC account — stored in the policy or fetched from on-chain
            # For now we log a warning if not available (requires user_usdc_account field)
            user_usdc_account = getattr(policy, "userUsdcAccount", None)
            treasury_usdc_account = getattr(policy, "treasuryUsdcAccount", None)

            if not user_usdc_account or not treasury_usdc_account:
                logger.warning(
                    "Policy %s missing USDC account fields — skipping on-chain call, recording failure.",
                    policy.id,
                )
                await db.premiumpayment.create(
                    data={
                        "policyId": policy.id,
                        "paymentIndex": payment_index,
                        "amount": policy.monthlyPremium,
                        "status": "failed",
                        "failureReason": "Missing userUsdcAccount or treasuryUsdcAccount on policy record.",
                    }
                )
                continue

            # Derive treasury PDA
            from app.core.solana_client import derive_treasury_pda
            treasury_pda, _ = derive_treasury_pda(
                settings.IRIS_PROGRAM_ID,
                treasury_admin_pubkey or "",
            ) if treasury_admin_pubkey else ("", 0)

            tx_sig = await oracle_pay_monthly_premium(
                policy_pda=policy.escrowAccount,
                treasury_pda=treasury_pda,
                user_usdc_account=user_usdc_account,
                treasury_usdc_account=treasury_usdc_account,
                payment_index=payment_index,
                premium_record_pda=premium_record_pda,
            )

            if tx_sig:
                # Success — record payment, advance counter and next due date
                import datetime as _dt
                next_due = now + _dt.timedelta(days=30)
                await db.premiumpayment.create(
                    data={
                        "policyId": policy.id,
                        "paymentIndex": payment_index,
                        "amount": policy.monthlyPremium,
                        "txHash": tx_sig,
                        "status": "paid",
                    }
                )
                await db.policy.update(
                    where={"id": policy.id},
                    data={
                        "paymentsCount": policy.paymentsCount + 1,
                        "nextPaymentDue": next_due,
                    },
                )
                logger.info(
                    "Collected premium for policy %s (index %d). Tx: %s",
                    policy.id,
                    payment_index,
                    tx_sig,
                )
            else:
                # Failed — record failure for UI to surface
                await db.premiumpayment.create(
                    data={
                        "policyId": policy.id,
                        "paymentIndex": payment_index,
                        "amount": policy.monthlyPremium,
                        "status": "failed",
                        "failureReason": "Oracle on-chain call failed. Check wallet delegation.",
                    }
                )
                logger.error(
                    "Failed to collect premium for policy %s (index %d).",
                    policy.id,
                    payment_index,
                )

    except Exception as exc:
        logger.exception("collect_due_premiums error: %s", exc)


async def expire_due_policies() -> None:
    """
    Find active policies past their end date and expire them on-chain + in DB.
    """
    try:
        from app.core.db import db
        from app.core.config import settings
        from app.core.solana_client import oracle_expire_policy, derive_treasury_pda
        import base58 as _base58
        from solders.keypair import Keypair

        now = datetime.now(timezone.utc)

        expired_policies = await db.policy.find_many(
            where={
                "status": "active",
                "endDate": {"lte": now},
            }
        )

        if not expired_policies:
            return

        logger.info("Expiring %d policy/ies.", len(expired_policies))

        treasury_admin_pubkey: str | None = None
        try:
            if settings.ORACLE_PRIVATE_KEY_B58:
                raw = _base58.b58decode(settings.ORACLE_PRIVATE_KEY_B58)
                kp = Keypair.from_bytes(raw)
                treasury_admin_pubkey = str(kp.pubkey())
        except Exception:
            pass

        for policy in expired_policies:
            if policy.escrowAccount and treasury_admin_pubkey:
                treasury_pda, _ = derive_treasury_pda(
                    settings.IRIS_PROGRAM_ID, treasury_admin_pubkey
                )
                await oracle_expire_policy(
                    policy_pda=policy.escrowAccount,
                    treasury_pda=treasury_pda,
                )

            await db.policy.update(
                where={"id": policy.id},
                data={"status": "expired"},
            )
            logger.info("Policy %s expired.", policy.id)

    except Exception as exc:
        logger.exception("expire_due_policies error: %s", exc)


async def run_scheduler_tick() -> None:
    """Single scheduler tick — collect premiums then expire policies."""
    logger.debug("Scheduler tick started.")
    await asyncio.gather(
        collect_due_premiums(),
        expire_due_policies(),
    )
    logger.debug("Scheduler tick completed.")


def start_scheduler(app) -> None:
    """
    Attach an APScheduler AsyncIOScheduler to the FastAPI app lifespan.
    Call this inside the lifespan startup block.
    """
    from app.core.config import settings

    if not settings.PREMIUM_SCHEDULER_ENABLED:
        logger.info("Premium scheduler disabled (PREMIUM_SCHEDULER_ENABLED=false).")
        return

    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler

        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            run_scheduler_tick,
            trigger="interval",
            minutes=settings.PREMIUM_SCHEDULER_INTERVAL_MINUTES,
            id="premium_collector",
            name="Monthly Premium Collector",
            replace_existing=True,
            max_instances=1,
        )
        scheduler.start()
        logger.info(
            "Premium scheduler started (interval: %d min).",
            settings.PREMIUM_SCHEDULER_INTERVAL_MINUTES,
        )
        # Store reference so it can be shut down gracefully
        app.state.scheduler = scheduler
    except ImportError:
        logger.warning("APScheduler not installed — premium scheduler disabled.")


def stop_scheduler(app) -> None:
    """Gracefully shut down the scheduler on app shutdown."""
    scheduler = getattr(getattr(app, "state", None), "scheduler", None)
    if scheduler:
        scheduler.shutdown(wait=False)
        logger.info("Premium scheduler stopped.")
