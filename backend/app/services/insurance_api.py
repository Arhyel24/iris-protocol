"""
Insurance API Service
---------------------
Adapter layer between IRIS and real-world insurance provider APIs
(e.g. Qover, Boost Insurance, Otonomo).

The current implementation is a mock that returns deterministic responses
so the full settlement flow can be exercised end-to-end without a live API key.
Swap the methods for real HTTP calls when credentials are available.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any

logger = logging.getLogger(__name__)


class InsuranceQuote:
    """Normalised quote returned by the provider."""

    def __init__(
        self,
        ref: str,
        premium_amount: float,
        coverage_amount: float,
        currency: str,
        expires_at: datetime,
        raw: dict[str, Any],
    ) -> None:
        self.ref = ref
        self.premium_amount = premium_amount
        self.coverage_amount = coverage_amount
        self.currency = currency
        self.expires_at = expires_at
        self.raw = raw


class InsurancePolicy:
    """Normalised policy confirmation returned by the provider."""

    def __init__(self, ref: str, raw: dict[str, Any]) -> None:
        self.ref = ref
        self.raw = raw


class ClaimResult:
    """Normalised claim validation returned by the provider."""

    def __init__(self, approved: bool, payout_amount: float | None, note: str) -> None:
        self.approved = approved
        self.payout_amount = payout_amount
        self.note = note


class InsuranceAPIService:
    """
    Facade over the insurance provider HTTP API.

    Replace the mock bodies with real httpx calls once you have credentials.
    Example skeleton for a real call:

        async def _post(self, path: str, payload: dict) -> dict:
            async with httpx.AsyncClient(base_url=self._base_url) as client:
                r = await client.post(path, json=payload, headers=self._headers())
                r.raise_for_status()
                return r.json()
    """

    def __init__(self, base_url: str = "", api_key: str = "") -> None:
        self._base_url = base_url
        self._api_key = api_key

    # ------------------------------------------------------------------
    # Quote
    # ------------------------------------------------------------------

    async def get_quote(
        self,
        product_type: str,
        coverage_amount: float,
        currency: str = "USDC",
        details: dict[str, Any] | None = None,
    ) -> InsuranceQuote:
        """Fetch a price quote from the insurance provider."""
        logger.info("Requesting quote: product=%s coverage=%s", product_type, coverage_amount)

        # --- MOCK ---
        rate = {"flight": 0.02, "gadget": 0.03, "travel": 0.015}.get(product_type, 0.025)
        premium = round(coverage_amount * rate, 2)
        ref = f"QUO-{uuid.uuid4().hex[:10].upper()}"
        raw = {
            "quoteId": ref,
            "product": product_type,
            "premium": premium,
            "coverage": coverage_amount,
            "currency": currency,
        }
        return InsuranceQuote(
            ref=ref,
            premium_amount=premium,
            coverage_amount=coverage_amount,
            currency=currency,
            expires_at=datetime.utcnow() + timedelta(hours=24),
            raw=raw,
        )

    # ------------------------------------------------------------------
    # Policy issuance
    # ------------------------------------------------------------------

    async def issue_policy(
        self,
        quote_ref: str,
        premium_tx_hash: str,
        escrow_account: str,
    ) -> InsurancePolicy:
        """
        Notify the provider that the premium has been paid on-chain and
        request formal policy issuance.
        """
        logger.info("Issuing policy for quote=%s tx=%s", quote_ref, premium_tx_hash)

        # --- MOCK ---
        ref = f"POL-{uuid.uuid4().hex[:10].upper()}"
        raw = {
            "policyId": ref,
            "quoteId": quote_ref,
            "premiumTx": premium_tx_hash,
            "escrow": escrow_account,
            "issuedAt": datetime.utcnow().isoformat(),
        }
        return InsurancePolicy(ref=ref, raw=raw)

    # ------------------------------------------------------------------
    # Claim validation
    # ------------------------------------------------------------------

    async def validate_claim(
        self,
        policy_ref: str,
        description: str,
        incident_date: datetime,
        proof_hash: str | None,
    ) -> ClaimResult:
        """
        Submit a claim to the provider for validation.
        The provider checks its own event data (e.g. flight DB, FNOL), then
        returns an approval decision and a payout amount.
        """
        logger.info("Validating claim for policy=%s incident=%s", policy_ref, incident_date)

        # --- MOCK: approve all claims with a 90 % payout ---
        return ClaimResult(
            approved=True,
            payout_amount=None,  # populated from policy coverage in real impl
            note="Claim automatically validated by mock insurance API.",
        )


# Module-level singleton – instantiated with values from Settings at startup.
_service: InsuranceAPIService | None = None


def get_insurance_service() -> InsuranceAPIService:
    global _service
    if _service is None:
        from app.core.config import settings
        _service = InsuranceAPIService(
            base_url=getattr(settings, "INSURANCE_API_URL", ""),
            api_key=getattr(settings, "INSURANCE_API_KEY", ""),
        )
    return _service
