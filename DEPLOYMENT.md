# IRIS Protocol — Deployment Guide

## Overview

| Service  | Platform (recommended)        | Notes                             |
| -------- | ----------------------------- | --------------------------------- |
| Backend  | **Railway** or **Render**     | Docker-based FastAPI + PostgreSQL |
| Frontend | **Vercel**                    | Next.js 15 app                    |
| Waitlist | **Vercel** (separate project) | Next.js 15 app                    |

---

## 1. Backend — Railway (Recommended)

Railway natively supports Docker and provisions managed PostgreSQL. This is the fastest path.

### Step 1 — Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select `iris-protocol` and set **Root Directory** to `backend`
4. Railway will detect the `Dockerfile` automatically

### Step 2 — Add a PostgreSQL database

1. In your project, click **+ Add Service → Database → PostgreSQL**
2. Railway will provision it and expose `DATABASE_URL` automatically as a variable

### Step 3 — Set environment variables

In the **backend** service → **Variables**, add every key from `backend/.env.example`:

```
DATABASE_URL          → (auto-filled by Railway PostgreSQL — do not override)
SECRET_KEY            → generate: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY        → generate: python -c "import secrets; print(secrets.token_hex(32))"
ENVIRONMENT           → production
LOG_LEVEL             → INFO
CORS_ORIGINS          → ["https://app.irisprotocol.xyz","https://iris-waitlist.vercel.app"]

HELIUS_API_KEY        → get from helius.dev
HELIUS_CLUSTER        → devnet  (or mainnet-beta for production)

IRIS_PROGRAM_ID       → ECDThuwStZ4a1ksQE2C9wakVoa4RYtBp5e7YAXsTJCHN
ORACLE_PUBKEY         → 4o38Z4NfYpuwRMRVyTRhcKuw71FcgaqEnMBCAridYqmx
TREASURY_PDA          → Dp6MNoxLKGgmCVvEMJ77EadGJb33b1dZVsMZWE56UCaZ
TREASURY_USDC_ATA     → 8hughUCV1PRRm9MCdxYfwXRa6WzvDWX7SRS5KgLN9M8a
ORACLE_PRIVATE_KEY_B58 → (export from oracle-keypair.json — see below)
USDC_MINT             → 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

EMAIL_USER            → your Gmail address
EMAIL_PASSWORD        → your Gmail App Password
EMAIL_FROM            → hello@yourdomain.com
EMAIL_SMTP_HOST       → smtp.gmail.com
EMAIL_SMTP_PORT       → 587
```

**Exporting the oracle private key:**

```powershell
python -c "import base58, json; k=json.load(open('oracle-keypair.json')); print(base58.b58encode(bytes(k)).decode())"
```

### Step 4 — Update the Dockerfile CMD (production mode)

The `Dockerfile` already runs `prisma db push` on startup — that's correct.
For production, change the CMD at the bottom of `backend/Dockerfile` to remove `--reload`:

```dockerfile
CMD ["sh", "-c", "prisma db push --schema=schema.prisma && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

This is already the production command (no `--reload`). ✅

### Step 5 — Deploy

Railway builds and deploys automatically on every push to `main`.  
Your backend URL will be something like `https://iris-backend-production.up.railway.app`.

---

## Alternative Backend: Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub repo, set **Root Directory** to `backend`
3. Render type: **Docker**
4. Add a **PostgreSQL** database from Render's dashboard
5. Set all env vars from the table above (Render provides `DATABASE_URL` for its DB)

---

## 2. Frontend — Vercel

### Step 1 — Import the project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the `iris-protocol` GitHub repo
3. Set **Root Directory** to `frontend`
4. Framework preset: **Next.js** (auto-detected)

### Step 2 — Set environment variables

In Vercel project settings → **Environment Variables**, add:

```
NEXT_PUBLIC_API_URL         → https://your-backend.up.railway.app
NEXT_PUBLIC_IRIS_PROGRAM_ID → ECDThuwStZ4a1ksQE2C9wakVoa4RYtBp5e7YAXsTJCHN
NEXT_PUBLIC_RPC_URL         → https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_USDC_MINT       → 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
NEXT_PUBLIC_ADMIN_PUBKEY    → 5F7UbQsPcJ7oMSygH9eoPhCgBxAmnZVkKuYaWt3i1K4s
```

### Step 3 — Deploy

Click **Deploy**. Vercel builds `next build` automatically.  
Your frontend URL: `https://iris-protocol-frontend.vercel.app` (or your custom domain).

---

## 3. Waitlist — Vercel (separate project)

### Step 1 — Import the project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the same `iris-protocol` repo
3. Set **Root Directory** to `waitlist`
4. Framework preset: **Next.js** (auto-detected)

### Step 2 — Set environment variables

```
NEXT_PUBLIC_API_URL → https://your-backend.up.railway.app
```

That's the only env var the waitlist needs.

### Step 3 — Deploy

Click **Deploy**.  
Your waitlist URL: `https://iris-waitlist.vercel.app` (or your custom domain).

---

## 4. Post-Deploy Checklist

After all three services are live:

- [ ] **Update `CORS_ORIGINS`** in the backend env to include your real frontend and waitlist URLs:
  ```
  CORS_ORIGINS=["https://app.irisprotocol.xyz","https://waitlist.irisprotocol.xyz"]
  ```
- [ ] **Update env vars** in Vercel projects if backend URL changed after Railway deployment
- [ ] **Test the full flow**: connect wallet → buy policy → check backend logs on Railway
- [ ] **Set a custom domain** in Vercel for both frontend and waitlist (optional)
- [ ] **Set a custom domain** in Railway for the backend API (optional)

---

## 5. Local Development (Quick Reference)

```powershell
# Backend
cd backend
$env:PATH = "C:\Users\Enoch\AppData\Roaming\Python\Python314\Scripts;" + $env:PATH
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
yarn dev   # runs on http://localhost:3000

# Waitlist
cd waitlist
yarn dev   # runs on http://localhost:3001 (or next available port)
```

Local `.env.local` files (not committed to git):

- `frontend/.env.local` — copy from `frontend/.env.local.example`
- `waitlist/.env.local` — copy from `waitlist/.env.local.example`

---

## 6. Docker Compose (Self-hosted / VPS)

To run the backend on your own server:

```bash
# On the server, in the /backend directory:
cp .env.example .env
# Edit .env with real values
docker compose up -d
```

This spins up PostgreSQL + FastAPI together. Expose port 8000 via nginx/Caddy with TLS.

**Caddy example** (simplest TLS setup):

```
api.irisprotocol.xyz {
    reverse_proxy localhost:8000
}
```
