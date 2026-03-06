# IRIS Protocol — Pitch Deck

### Decentralized Insurance on Solana

---

## Slide 1 — Title

**IRIS Protocol**
_Insurance, Reimagined on Chain_

> Transparent. Instant. Trustless.

- Decentralized insurance protocol built on Solana
- Premiums paid in USDC · Payouts settled on-chain
- No middlemen. No delays. No black boxes.

**Tagline:** _We don't promise to pay. The blockchain does._

---

## Slide 2 — The Problem

### Insurance is Broken

| What users expect   | What they get              |
| ------------------- | -------------------------- |
| Fast payouts        | Weeks or months of waiting |
| Transparent process | Opaque claim reviews       |
| Fair decisions      | Arbitrary rejections       |
| Low overhead        | 30–40% in admin fees       |

**$6.3 trillion** in global insurance premiums collected annually.
**Claim denial rates** average 15–20% — often without clear reason.

Users have no visibility into where their premium goes or why a claim is rejected.

---

## Slide 3 — The Solution

### IRIS Protocol

A decentralized insurance layer where:

- ✅ Premiums are locked **on-chain** in a verifiable escrow
- ✅ Policy terms are stored **immutably** on Solana
- ✅ Payouts are executed by a **trustless oracle** — not a claims adjuster
- ✅ Every action is **publicly auditable** on-chain
- ✅ Claims are reviewed via a **transparent admin process**, fully logged

**The user never has to trust us. They trust the program.**

---

## Slide 4 — How It Works

### The IRIS Flow

```
User → Connect Wallet → Get Quote → Pay Premium (USDC)
     → Policy minted on-chain (Solana program)
     → Incident occurs → File Claim (with proof)
     → Admin reviews → Oracle triggers payout
     → USDC lands in user's wallet · tx hash on explorer
```

**Three on-chain actors:**

1. **User wallet** — pays premiums, receives payouts
2. **Treasury PDA** — holds USDC pool, program-controlled
3. **Oracle wallet** — executes approved payouts, no discretion

**Admin approval is the only human step — and it's logged, signed, and auditable.**

---

## Slide 5 — Product Demo

### What We Built

**For Users (frontend app):**

- Connect Phantom / any Solana wallet
- Get an instant insurance quote (travel, device, event)
- Pay with USDC — policy minted immediately
- View live policy status and payment history
- File a claim with description + incident date
- Track claim status in real time

**For Admins (IRIS Ops Portal):**

- Email OTP login — no passwords stored
- Dashboard: live treasury balance, oracle SOL, program status
- One-click claim review with wallet signature authorization
- Full protocol audit trail (every action logged)
- User and policy management

---

## Slide 6 — Technology Stack

### Built for Scale, Built for Trust

| Layer               | Technology                                |
| ------------------- | ----------------------------------------- |
| **Blockchain**      | Solana (sub-second finality, $0.00025/tx) |
| **Smart Contracts** | Anchor Framework (Rust)                   |
| **Stablecoin**      | USDC (SPL token)                          |
| **Backend**         | FastAPI (Python) + PostgreSQL + Prisma    |
| **Frontend**        | Next.js 15 + Tailwind CSS                 |
| **Auth**            | Wallet-signed JWT (no passwords)          |
| **Notifications**   | Transactional email (SMTP)                |
| **Oracle**          | Custom off-chain oracle, Ed25519 signed   |

**Deployed on Solana Devnet** — mainnet-ready architecture.

---

## Slide 7 — On-Chain Architecture

### How the Money Moves (Trustlessly)

```
[User Wallet]
     │ pay_monthly_premium()
     ▼
[Policy PDA] ──── escrowAccount ───▶ [Treasury PDA]
                                           │
                              [Oracle Wallet signs]
                                           │
                               trigger_payout()
                                           │
                                           ▼
                              [User USDC ATA] ← payout lands here
```

- **Policy PDA** — unique account per policy, stores terms on-chain
- **Treasury PDA** — program-derived, no single party controls it
- **Payout Record PDA** — prevents double-spend on single claim
- **Oracle** — off-chain signer, on-chain state changes only

Every payout is a verifiable Solana transaction. Anyone can audit it.

---

## Slide 8 — Traction & Validation

### Where We Are Today

**Protocol:**

- ✅ Smart contract deployed on Solana Devnet
- ✅ Full purchase → claim → payout flow working end-to-end
- ✅ On-chain payout transactions verified on Solana Explorer
- ✅ Treasury holding live USDC balance ($13+ USDC on devnet)
- ✅ Oracle wallet processing real devnet transactions

**Product:**

- ✅ User-facing app live and functional
- ✅ Admin portal with OTP auth, activity logs, chain monitoring
- ✅ Automated email notifications for all user actions
- ✅ Balance-gated approvals (can't approve what can't be paid)

**Target market:** $180B+ travel insurance market alone.

---

## Slide 9 — Roadmap

### Path to Mainnet

| Phase                      | Timeline | Milestones                                    |
| -------------------------- | -------- | --------------------------------------------- |
| **Phase 1 — MVP** ✅       | Now      | Devnet deployment, full flow, admin portal    |
| **Phase 2 — Audit**        | Q2 2026  | Smart contract security audit, bug bounty     |
| **Phase 3 — Mainnet Beta** | Q3 2026  | Mainnet launch, first real premiums           |
| **Phase 4 — Expand**       | Q4 2026  | Multiple product lines, DAO governance        |
| **Phase 5 — Scale**        | 2027     | Cross-chain, institutional liquidity partners |

**Revenue model:**

- 5–10% protocol fee on every premium collected
- Float yield on treasury USDC (DeFi integrations)

---

## Slide 10 — The Ask

### Why IRIS. Why Now.

**The opportunity:**

- DeFi has solved lending, trading, and yield — **insurance is next**
- Solana's speed and cost make micro-premium insurance viable for the first time
- Users are tired of legacy insurance black boxes

**What we need:**

- **Funding** to cover audit costs, mainnet launch, and first liquidity pool
- **Partnerships** with travel platforms, exchanges, and wallets for distribution
- **Advisors** with insurance/fintech regulatory experience

**What you get:**

- Ground-floor access to the decentralized insurance primitive on Solana
- Protocol fee revenue from day one of mainnet
- A working product — not a whitepaper

---

> **IRIS Protocol** — _Every payout is a Solana transaction. Verifiable. Instant. Unstoppable._
>
> Live demo: [your-domain.com] · Program: `ECDThuwStZ4a1ksQE2C9wakVoa4RYtBp5e7YAXsTJCHN`
