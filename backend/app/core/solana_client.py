"""
IRIS Protocol — Solana Oracle Client
======================================
Handles all on-chain interactions that the backend oracle must perform:
  • trigger_payout  — called when admin approves a claim
  • pay_monthly_premium — called by the scheduler for each due policy
  • expire_policy   — called when a policy's end date passes

Uses `anchorpy` to build and send Anchor program instructions, and
`solders` for keypair management.
"""

from __future__ import annotations

import base64
import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ── Lazy imports (so the backend starts even if Solana deps are not installed
#   in dev environments that only run tests against mock infrastructure) ────────

def _get_solana_client():
    """Return a configured AnchorClient or None if deps are not available."""
    try:
        from anchorpy import Program, Provider, Wallet
        from anchorpy.provider import DEFAULT_OPTIONS
        from solana.rpc.async_api import AsyncClient
        from solders.keypair import Keypair
        from solders.pubkey import Pubkey
        import base58 as _base58

        from app.core.config import settings

        if not settings.ORACLE_PRIVATE_KEY_B58:
            logger.warning(
                "ORACLE_PRIVATE_KEY_B58 not set — on-chain oracle calls disabled."
            )
            return None

        raw_bytes = _base58.b58decode(settings.ORACLE_PRIVATE_KEY_B58)
        oracle_kp = Keypair.from_bytes(raw_bytes)
        rpc_url = settings.HELIUS_RPC_URL if settings.HELIUS_API_KEY else "https://api.devnet.solana.com"
        return oracle_kp, rpc_url, settings.IRIS_PROGRAM_ID
    except ImportError:
        logger.warning("anchorpy/solders not installed — on-chain oracle calls disabled.")
        return None


# ─── PDA derivation helpers ────────────────────────────────────────────────────

def derive_treasury_pda(program_id: str, admin_pubkey: str) -> tuple[str, int]:
    from solders.pubkey import Pubkey
    prog = Pubkey.from_string(program_id)
    admin = Pubkey.from_string(admin_pubkey)
    pda, bump = Pubkey.find_program_address(
        [b"treasury", bytes(admin)], prog
    )
    return str(pda), bump


def derive_policy_pda(program_id: str, user_pubkey: str, quote_id: str) -> tuple[str, int]:
    from solders.pubkey import Pubkey
    prog = Pubkey.from_string(program_id)
    user = Pubkey.from_string(user_pubkey)
    pda, bump = Pubkey.find_program_address(
        [b"policy", bytes(user), quote_id.encode()], prog
    )
    return str(pda), bump


def derive_premium_record_pda(program_id: str, policy_pubkey: str, index: int) -> str:
    from solders.pubkey import Pubkey
    prog = Pubkey.from_string(program_id)
    policy = Pubkey.from_string(policy_pubkey)
    index_bytes = index.to_bytes(4, "little")
    pda, _ = Pubkey.find_program_address(
        [b"premium", bytes(policy), index_bytes], prog
    )
    return str(pda)


def derive_payout_record_pda(program_id: str, policy_pubkey: str, index: int) -> str:
    from solders.pubkey import Pubkey
    prog = Pubkey.from_string(program_id)
    policy = Pubkey.from_string(policy_pubkey)
    index_bytes = index.to_bytes(4, "little")
    pda, _ = Pubkey.find_program_address(
        [b"payout", bytes(policy), index_bytes], prog
    )
    return str(pda)


# ─── Oracle operations ─────────────────────────────────────────────────────────

async def oracle_pay_monthly_premium(
    *,
    policy_pda: str,
    treasury_pda: str,
    user_usdc_account: str,
    treasury_usdc_account: str,
    payment_index: int,
    premium_record_pda: str,
) -> Optional[str]:
    """
    Oracle calls pay_monthly_premium on-chain.
    Returns the transaction signature, or None on failure.
    """
    ctx = _get_solana_client()
    if ctx is None:
        logger.warning("Skipping pay_monthly_premium — oracle not configured.")
        return None

    oracle_kp, rpc_url, program_id = ctx
    try:
        from anchorpy import Program, Provider, Wallet
        from solana.rpc.async_api import AsyncClient
        from solders.pubkey import Pubkey
        from anchorpy.idl import Idl
        import anchorpy

        # Load IDL from the compiled target directory
        idl_path = Path(__file__).parent.parent.parent.parent / "anchor" / "target" / "idl" / "anchor.json"
        if not idl_path.exists():
            logger.error("Anchor IDL not found at %s — run `anchor build` first.", idl_path)
            return None

        idl_raw = json.loads(idl_path.read_text())
        connection = AsyncClient(rpc_url)
        wallet = Wallet(oracle_kp)
        provider = Provider(connection, wallet)
        program = Program(Idl.from_json(json.dumps(idl_raw)), Pubkey.from_string(program_id), provider)

        tx_sig = await program.rpc["pay_monthly_premium"](
            payment_index,
            ctx=anchorpy.Context(
                accounts={
                    "premium_record": Pubkey.from_string(premium_record_pda),
                    "policy_state": Pubkey.from_string(policy_pda),
                    "treasury_state": Pubkey.from_string(treasury_pda),
                    "user_usdc": Pubkey.from_string(user_usdc_account),
                    "treasury_usdc": Pubkey.from_string(treasury_usdc_account),
                    "oracle": oracle_kp.pubkey(),
                    "token_program": Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    "system_program": Pubkey.from_string("11111111111111111111111111111111"),
                }
            ),
        )
        logger.info("pay_monthly_premium tx: %s (policy=%s, index=%d)", tx_sig, policy_pda, payment_index)
        await connection.close()
        return str(tx_sig)
    except Exception as exc:
        logger.error("pay_monthly_premium failed for policy %s index %d: %s", policy_pda, payment_index, exc)
        return None


async def oracle_trigger_payout(
    *,
    policy_pda: str,
    treasury_pda: str,
    user_usdc_account: str,
    treasury_usdc_account: str,
    claim_id: str,
    payout_amount_lamports: int,
    payout_index: int,
) -> Optional[str]:
    """
    Oracle releases a claim payout on-chain.
    Returns the transaction signature, or None on failure.
    """
    ctx = _get_solana_client()
    if ctx is None:
        logger.warning("Skipping trigger_payout — oracle not configured.")
        return None

    oracle_kp, rpc_url, program_id = ctx
    try:
        from anchorpy import Program, Provider, Wallet
        from solana.rpc.async_api import AsyncClient
        from solders.pubkey import Pubkey
        from anchorpy.idl import Idl
        import anchorpy

        idl_path = Path(__file__).parent.parent.parent.parent / "anchor" / "target" / "idl" / "anchor.json"
        if not idl_path.exists():
            logger.error("Anchor IDL not found — run `anchor build`.")
            return None

        idl_raw = json.loads(idl_path.read_text())
        payout_record_pda = derive_payout_record_pda(program_id, policy_pda, payout_index)

        connection = AsyncClient(rpc_url)
        wallet = Wallet(oracle_kp)
        provider = Provider(connection, wallet)
        program = Program(Idl.from_json(json.dumps(idl_raw)), Pubkey.from_string(program_id), provider)

        tx_sig = await program.rpc["trigger_payout"](
            claim_id,
            payout_amount_lamports,
            payout_index,
            ctx=anchorpy.Context(
                accounts={
                    "payout_record": Pubkey.from_string(payout_record_pda),
                    "treasury_state": Pubkey.from_string(treasury_pda),
                    "policy_state": Pubkey.from_string(policy_pda),
                    "treasury_usdc": Pubkey.from_string(treasury_usdc_account),
                    "user_usdc": Pubkey.from_string(user_usdc_account),
                    "admin": oracle_kp.pubkey(),
                    "token_program": Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    "system_program": Pubkey.from_string("11111111111111111111111111111111"),
                }
            ),
        )
        logger.info("trigger_payout tx: %s (claim=%s, amount=%d)", tx_sig, claim_id, payout_amount_lamports)
        await connection.close()
        return str(tx_sig)
    except Exception as exc:
        logger.error("trigger_payout failed for claim %s: %s", claim_id, exc)
        return None


async def oracle_expire_policy(
    *,
    policy_pda: str,
    treasury_pda: str,
) -> Optional[str]:
    """Mark a policy as expired on-chain."""
    ctx = _get_solana_client()
    if ctx is None:
        return None

    oracle_kp, rpc_url, program_id = ctx
    try:
        from anchorpy import Program, Provider, Wallet
        from solana.rpc.async_api import AsyncClient
        from solders.pubkey import Pubkey
        from anchorpy.idl import Idl
        import anchorpy

        idl_path = Path(__file__).parent.parent.parent.parent / "anchor" / "target" / "idl" / "anchor.json"
        if not idl_path.exists():
            return None

        idl_raw = json.loads(idl_path.read_text())
        connection = AsyncClient(rpc_url)
        wallet = Wallet(oracle_kp)
        provider = Provider(connection, wallet)
        program = Program(Idl.from_json(json.dumps(idl_raw)), Pubkey.from_string(program_id), provider)

        tx_sig = await program.rpc["expire_policy"](
            ctx=anchorpy.Context(
                accounts={
                    "policy_state": Pubkey.from_string(policy_pda),
                    "treasury_state": Pubkey.from_string(treasury_pda),
                    "oracle": oracle_kp.pubkey(),
                }
            ),
        )
        await connection.close()
        return str(tx_sig)
    except Exception as exc:
        logger.error("expire_policy failed for %s: %s", policy_pda, exc)
        return None


# ─── Chain info for admin dashboard ───────────────────────────────────────────

async def get_oracle_sol_balance(oracle_pubkey: str, rpc_url: str = "https://api.devnet.solana.com") -> float:
    """Return oracle wallet SOL balance via JSON-RPC (no solana-py required)."""
    import httpx
    payload = {
        "jsonrpc": "2.0", "id": 1,
        "method": "getBalance",
        "params": [oracle_pubkey, {"commitment": "confirmed"}],
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(rpc_url, json=payload)
            r.raise_for_status()
            lamports = r.json()["result"]["value"]
            return lamports / 1_000_000_000
    except Exception as exc:
        logger.error("get_oracle_sol_balance failed: %s", exc)
        return 0.0


async def get_usdc_ata_balance(ata_address: str, rpc_url: str = "https://api.devnet.solana.com") -> float:
    """Return USDC balance of a token account (ATA) in UI units via JSON-RPC."""
    import httpx
    payload = {
        "jsonrpc": "2.0", "id": 1,
        "method": "getTokenAccountBalance",
        "params": [ata_address, {"commitment": "confirmed"}],
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(rpc_url, json=payload)
            r.raise_for_status()
            data = r.json()
            if "error" in data:
                logger.warning("getTokenAccountBalance error: %s", data["error"])
                return 0.0
            ui_amount = data["result"]["value"].get("uiAmount") or 0
            return float(ui_amount)
    except Exception as exc:
        logger.error("get_usdc_ata_balance failed: %s", exc)
        return 0.0
