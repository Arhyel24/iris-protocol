"""
Escrow Service
--------------
Abstraction over Solana escrow interactions for IRIS.

Flow:
  1. User pays premium → premiumTxHash stored on Policy.
  2. This service verifies the tx and derives the escrow PDA.
  3. On claim approval → release_payout() instructs the on-chain program
     to transfer funds from the escrow PDA to the user's wallet.

The current implementation is a **mock** that simulates on-chain behaviour
so the API can be exercised without a live Solana connection.
Replace mock bodies with real Solana RPC / anchor client calls.
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class EscrowVerification:
    valid: bool
    pda: str               # Solana PDA address
    amount: float
    currency: str
    message: str


@dataclass
class PayoutResult:
    success: bool
    tx_hash: str           # Solana transaction signature
    amount: float
    message: str


class EscrowService:
    """
    Thin wrapper over the IRIS Solana escrow program.

    Replace the mock bodies with real calls using:
      - solders (Rust-backed Solana Python bindings), or
      - anchorpy (Anchor IDL client), or
      - direct JSON-RPC calls to Helius/Quicknode.
    """

    def __init__(self, rpc_url: str = "https://api.devnet.solana.com") -> None:
        self._rpc_url = rpc_url

    # ------------------------------------------------------------------
    # Verify premium transaction
    # ------------------------------------------------------------------

    async def verify_premium_tx(
        self,
        tx_hash: str,
        expected_amount: float,
        currency: str = "USDC",
    ) -> EscrowVerification:
        """
        Confirm that the on-chain tx transferred the expected premium amount
        into an escrow PDA and return the PDA address.
        """
        logger.info("Verifying premium tx=%s amount=%s %s", tx_hash, expected_amount, currency)

        # --- MOCK ---
        pda = f"ESC{uuid.uuid4().hex[:20].upper()}"
        return EscrowVerification(
            valid=True,
            pda=pda,
            amount=expected_amount,
            currency=currency,
            message="Premium verified (mock).",
        )

    # ------------------------------------------------------------------
    # Release payout
    # ------------------------------------------------------------------

    async def release_payout(
        self,
        escrow_pda: str,
        recipient_wallet: str,
        amount: float,
        currency: str = "USDC",
    ) -> PayoutResult:
        """
        Instruct the on-chain escrow program to transfer `amount` from the
        escrow PDA to the recipient's wallet.
        """
        logger.info(
            "Releasing payout: pda=%s → wallet=%s amount=%s %s",
            escrow_pda, recipient_wallet, amount, currency,
        )

        # --- MOCK ---
        tx_hash = f"{uuid.uuid4().hex}{uuid.uuid4().hex}"
        return PayoutResult(
            success=True,
            tx_hash=tx_hash,
            amount=amount,
            message="Payout released (mock).",
        )

    # ------------------------------------------------------------------
    # Refund (on policy cancellation)
    # ------------------------------------------------------------------

    async def refund_premium(
        self,
        escrow_pda: str,
        recipient_wallet: str,
        amount: float,
        currency: str = "USDC",
    ) -> PayoutResult:
        """Return the premium to the user when a policy is cancelled."""
        logger.info("Refunding premium: pda=%s → wallet=%s", escrow_pda, recipient_wallet)

        # --- MOCK ---
        tx_hash = f"{uuid.uuid4().hex}{uuid.uuid4().hex}"
        return PayoutResult(
            success=True,
            tx_hash=tx_hash,
            amount=amount,
            message="Premium refunded (mock).",
        )


# Module-level singleton
_service: EscrowService | None = None


def get_escrow_service() -> EscrowService:
    global _service
    if _service is None:
        from app.core.config import settings
        _service = EscrowService(rpc_url=settings.HELIUS_RPC_URL)
    return _service
