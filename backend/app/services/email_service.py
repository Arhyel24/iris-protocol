"""
IRIS Protocol — Email Service
==============================
Sends transactional emails via Gmail SMTP (TLS).
All methods are fire-and-forget coroutines: they log errors but never raise,
so a mail failure never breaks the main request flow.
"""

from __future__ import annotations

import asyncio
import logging
import smtplib
from email.headerregistry import Address
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from functools import partial

from app.core.config import settings

logger = logging.getLogger(__name__)

SENDER_NAME = "IRIS Protocol"


def _from_header() -> str:
    """Return a properly formatted From header: IRIS Protocol <hello@asoose.com>."""
    addr = settings.EMAIL_FROM or settings.EMAIL_USER
    return formataddr((SENDER_NAME, addr))


def _send_sync(to: str, subject: str, html: str, text: str) -> None:
    """Blocking SMTP call — run inside a thread pool."""
    if not settings.EMAIL_USER:
        logger.warning("EMAIL_USER not configured — email not sent (subject=%s)", subject)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = _from_header()
    msg["To"] = to
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.EMAIL_SMTP_HOST, settings.EMAIL_SMTP_PORT, timeout=10) as s:
        s.ehlo()
        s.starttls()
        s.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        s.sendmail(settings.EMAIL_FROM or settings.EMAIL_USER, [to], msg.as_string())
    logger.info("Email sent to %s | %s", to, subject)


async def send_email(to: str, subject: str, html: str, plain: str = "") -> None:
    """Non-blocking wrapper — dispatches to a thread so FastAPI is not blocked."""
    if not to or "@" not in to:
        logger.debug("Skipping email — no valid address (to=%r)", to)
        return
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, partial(_send_sync, to, subject, html, plain or subject))
    except Exception as exc:
        logger.error("Email delivery failed to %s: %s", to, exc)


# ── Template helpers ───────────────────────────────────────────────────────────

def _base(title: str, body: str) -> str:
    """Wrap body in a minimal branded HTML shell."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{{background:#000;color:#e5e7eb;font-family:'Courier New',monospace;margin:0;padding:0}}
  .wrap{{max-width:560px;margin:40px auto;background:#0a0a0a;border:1px solid #1f2937;padding:32px}}
  h1{{color:#00FFA3;font-size:18px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:24px}}
  p{{font-size:13px;line-height:1.7;color:#9ca3af;margin:0 0 16px}}
  .otp{{font-size:36px;font-weight:900;color:#00FFA3;letter-spacing:.3em;display:block;margin:24px 0;text-align:center}}
  .badge{{display:inline-block;border:1px solid #374151;padding:4px 10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.1em}}
  .footer{{margin-top:32px;border-top:1px solid #1f2937;padding-top:16px;font-size:11px;color:#4b5563}}
  .green{{color:#00FFA3}}.red{{color:#ef4444}}.yellow{{color:#f59e0b}}
  a{{color:#00FFA3;text-decoration:none}}
</style>
</head>
<body><div class="wrap">
<h1>IRIS Protocol</h1>
{body}
<div class="footer">This is an automated message from IRIS Protocol &mdash; asoose.com.<br>Do not reply to this email.</div>
</div></body>
</html>"""


# ── Specific email senders ─────────────────────────────────────────────────────

async def send_admin_otp(email: str, otp: str, wallet: str) -> None:
    html = _base(
        "Admin Login OTP",
        f"""
<p>A login attempt was made for the IRIS Protocol admin portal using wallet:</p>
<p><span class="badge">{wallet[:16]}…</span></p>
<p>Your one-time access code is:</p>
<span class="otp">{otp}</span>
<p>This code expires in <strong class="green">10 minutes</strong>. Do not share it with anyone.</p>
<p>If you did not request this, please secure your account immediately.</p>
"""
    )
    await send_email(email, "IRIS Admin Portal — One-Time Access Code", html, f"Your IRIS admin OTP: {otp}")


async def send_welcome(email: str, wallet: str) -> None:
    html = _base(
        "Welcome to IRIS Protocol",
        f"""
<p>Welcome to <strong class="green">IRIS Protocol</strong> — your decentralized insurance bridge on Solana.</p>
<p>Your wallet <span class="badge">{wallet[:16]}…</span> has been successfully registered.</p>
<p>You can now:</p>
<p>→ Get an insurance quote<br>→ Purchase a policy with USDC<br>→ File claims directly from the app</p>
<p>All premium payments and payouts are handled transparently on-chain.</p>
"""
    )
    await send_email(email, "Welcome to IRIS Protocol", html, f"Welcome to IRIS Protocol! Your wallet {wallet} is registered.")


async def send_policy_created(email: str, wallet: str, product: str, coverage: float, premium: float, tx_hash: str) -> None:
    html = _base(
        "Policy Activated",
        f"""
<p>Your <strong class="green">{product.upper()}</strong> insurance policy has been activated.</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:16px 0">
  <tr><td style="padding:6px 0;color:#6b7280">Coverage Amount</td><td style="text-align:right;color:#e5e7eb">${coverage:,.2f} USDC</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Monthly Premium</td><td style="text-align:right;color:#e5e7eb">${premium:,.4f} USDC</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Payment Tx</td><td style="text-align:right"><a href="https://explorer.solana.com/tx/{tx_hash}?cluster=devnet">{tx_hash[:16]}…</a></td></tr>
</table>
<p>Your policy is now active and on-chain. You can file a claim from your dashboard at any time.</p>
"""
    )
    await send_email(email, f"IRIS — {product.title()} Policy Activated", html)


async def send_claim_submitted(email: str, wallet: str, claim_id: str, product: str, coverage: float) -> None:
    html = _base(
        "Claim Submitted",
        f"""
<p>Your claim has been submitted and is under review by the IRIS team.</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:16px 0">
  <tr><td style="padding:6px 0;color:#6b7280">Claim ID</td><td style="text-align:right;color:#e5e7eb">{claim_id[:16]}…</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Product</td><td style="text-align:right;color:#e5e7eb">{product.upper()}</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Coverage</td><td style="text-align:right;color:#e5e7eb">${coverage:,.2f} USDC</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Status</td><td style="text-align:right"><span class="yellow">PENDING REVIEW</span></td></tr>
</table>
<p>Our team will review your claim and notify you by email once a decision is made. Typically within 24–48 hours.</p>
"""
    )
    await send_email(email, "IRIS — Claim Submitted for Review", html)


async def send_claim_approved(email: str, wallet: str, claim_id: str, payout: float, tx_hash: str, note: str | None) -> None:
    html = _base(
        "Claim Approved",
        f"""
<p>Great news — your claim has been <strong class="green">APPROVED</strong> and the payout has been processed.</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:16px 0">
  <tr><td style="padding:6px 0;color:#6b7280">Claim ID</td><td style="text-align:right;color:#e5e7eb">{claim_id[:16]}…</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Payout Amount</td><td style="text-align:right"><span class="green">${payout:,.2f} USDC</span></td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Recipient</td><td style="text-align:right;color:#e5e7eb">{wallet[:16]}…</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Tx Hash</td><td style="text-align:right"><a href="https://explorer.solana.com/tx/{tx_hash}?cluster=devnet">{tx_hash[:16]}…</a></td></tr>
</table>
{f'<p style="color:#6b7280;font-style:italic">Review note: {note}</p>' if note else ''}
<p>The funds have been transferred to your wallet via the IRIS on-chain escrow program.</p>
"""
    )
    await send_email(email, "IRIS — Claim Approved & Payout Sent", html)


async def send_claim_rejected(email: str, wallet: str, claim_id: str, note: str | None) -> None:
    html = _base(
        "Claim Rejected",
        f"""
<p>We regret to inform you that your claim has been <strong class="red">REJECTED</strong> after review.</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:16px 0">
  <tr><td style="padding:6px 0;color:#6b7280">Claim ID</td><td style="text-align:right;color:#e5e7eb">{claim_id[:16]}…</td></tr>
  <tr><td style="padding:6px 0;color:#6b7280">Status</td><td style="text-align:right"><span class="red">REJECTED</span></td></tr>
</table>
{f'<p><strong>Review note:</strong> {note}</p>' if note else ''}
<p>If you believe this decision was made in error, please contact our support team with additional documentation.</p>
"""
    )
    await send_email(email, "IRIS — Claim Decision: Rejected", html)


async def send_user_role_changed(email: str, wallet: str, new_role: str) -> None:
    html = _base(
        "Account Role Updated",
        f"""
<p>Your IRIS Protocol account role has been updated.</p>
<p>New role: <span class="{'green' if new_role == 'admin' else 'badge'}">{new_role.upper()}</span></p>
<p>Wallet: <span class="badge">{wallet[:16]}…</span></p>
"""
    )
    await send_email(email, f"IRIS — Account Role Updated: {new_role.upper()}", html)


async def send_policy_status_changed(email: str, wallet: str, product: str, new_status: str) -> None:
    color = "green" if new_status == "active" else "red" if new_status == "cancelled" else "badge"
    html = _base(
        "Policy Status Updated",
        f"""
<p>Your <strong>{product.upper()}</strong> insurance policy status has been updated.</p>
<p>New status: <span class="{color}">{new_status.upper()}</span></p>
"""
    )
    await send_email(email, f"IRIS — Policy Status Updated: {new_status.upper()}", html)
