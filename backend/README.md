# IRIS Protocol Backend API

> Settlement layer connecting Real-World Insurance APIs to Solana escrows.
> Users pay premiums on-chain (USDC/SOL); approved claims trigger automatic escrow payouts.

---

## Overview

The IRIS backend is a **FastAPI** service that sits between the IRIS frontend/wallet and:

- **Real-world insurance providers** (Qover, Boost, etc.) for quote pricing and claim validation
- **Solana on-chain programs** for escrow management (premium lock-in, payout release, refunds)
- **PostgreSQL via Prisma** for persistent policy, claim, and user data

### Settlement Flow

```
User connects wallet
   requests quote (insurance API prices the risk)
   pays premium on-chain  locked in Solana escrow PDA
   backend issues policy (notifies insurance provider)
   user files claim  insurance API validates event
   escrow releases payout tx to user wallet
```

---

## Stack

| Layer        | Technology                      |
| ------------ | ------------------------------- |
| Framework    | FastAPI 0.115+                  |
| Runtime      | Python 3.12+ (3.14 supported)   |
| Database ORM | Prisma (prisma-client-py 0.15)  |
| Database     | PostgreSQL 16                   |
| Validation   | Pydantic v2 + pydantic-settings |
| HTTP client  | httpx (async)                   |
| Tests        | pytest + pytest-asyncio + httpx |
| Container    | Docker + docker-compose         |

---

## Project Structure

```
backend/
 app/
    main.py                   # App factory, lifespan, CORS, routing
    api/
       deps.py               # Shared FastAPI dependencies
       v1/
           router.py         # Aggregates all v1 routes under /api/v1
           endpoints/
               waitlist.py   # POST /waitlist/  join early access
               users.py      # POST /users/, GET /users/{wallet}
               quotes.py     # POST /quotes/  fetch insurance price
               policies.py   # POST /policies/  activate after on-chain payment
               claims.py     # POST /claims/, PATCH /{id}/review
    schemas/                  # Pydantic request/response models
    services/
       insurance_api.py      # Adapter for insurance provider HTTP API
       escrow.py             # Adapter for Solana escrow program
    core/
       config.py             # pydantic-settings (reads .env)
       db.py                 # Prisma singleton
       logging.py            # Structured logging setup
    tests/
        conftest.py
        test_waitlist.py
        test_insurance_flow.py
 schema.prisma                 # Database schema (User, Waitlist, Quote, Policy, Claim)
 requirements.txt
 Dockerfile
 docker-compose.yml
```

---

## Getting Started

### Option A Docker (recommended)

```bash
# From the project root
docker compose up --build
```

The API will be available at `http://localhost:8000`.
Swagger docs: `http://localhost:8000/docs`

### Option B Local (Python 3.12+)

**1. Install dependencies**

```bash
cd backend
pip install -r requirements.txt
```

**2. Create `.env`** (copy from `.env.example`)

```bash
cp .env.example .env
# edit DATABASE_URL, HELIUS_API_KEY etc.
```

**3. Generate Prisma client and push schema**

```powershell
# Windows: scripts may not be on PATH
$env:PATH += ";$env:APPDATA\Python\Python314\Scripts"
python -m prisma generate
python -m prisma db push
```

**4. Start the server**

```powershell
# Run from inside backend/
$env:PYTHONPATH = $PWD
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## API Reference

| Method | Path                           | Description                              |
| ------ | ------------------------------ | ---------------------------------------- |
| GET    | `/`                            | Health check                             |
| POST   | `/api/v1/waitlist/`            | Join early-access waitlist               |
| GET    | `/api/v1/waitlist/`            | [Admin] List all waitlist entries        |
| POST   | `/api/v1/users/`               | Register a Solana wallet                 |
| GET    | `/api/v1/users/{wallet}`       | Fetch user by wallet address             |
| POST   | `/api/v1/quotes/`              | Request an insurance quote               |
| GET    | `/api/v1/quotes/{id}`          | Fetch a specific quote                   |
| POST   | `/api/v1/policies/`            | Activate policy (after on-chain payment) |
| GET    | `/api/v1/policies/{id}`        | Fetch a policy                           |
| PATCH  | `/api/v1/policies/{id}/cancel` | Cancel an active policy                  |
| POST   | `/api/v1/claims/`              | File a claim against a policy            |
| GET    | `/api/v1/claims/{id}`          | Fetch a claim                            |
| PATCH  | `/api/v1/claims/{id}/review`   | [Admin] Approve / reject triggers payout |

Full interactive docs available at `/docs` (Swagger UI) and `/redoc`.

---

## Environment Variables

See `.env.example` for all required variables.

| Variable            | Description                            |
| ------------------- | -------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string           |
| `HELIUS_API_KEY`    | Helius RPC API key for Solana          |
| `HELIUS_CLUSTER`    | `mainnet-beta` or `devnet`             |
| `INSURANCE_API_URL` | Base URL of the insurance provider API |
| `INSURANCE_API_KEY` | API key for the insurance provider     |
| `SECRET_KEY`        | App secret (JWT signing, future auth)  |

---

## Running Tests

```bash
cd backend
pytest app/tests/ -v
```

---

## Maintainers

- **Enoch Philip** Lead Developer
  [GitHub](https://github.com/arhyel24) [Twitter](https://twitter.com/arhyel24)

---

## Contact

iris@projectiris.xyz
