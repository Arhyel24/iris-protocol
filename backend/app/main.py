"""
IRIS Protocol — Insurance Settlement Bridge
============================================
FastAPI application that bridges Real-World Insurance APIs to Solana escrows.

Flow:
  User pays premium on-chain (SOL/USDC)
    → locked in Solana escrow PDA
    → insurance API validates claim event
    → escrow releases payout to user wallet
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.db import db
from app.core.logging import setup_logging
from app.core.scheduler import start_scheduler, stop_scheduler

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("IRIS backend starting — connecting to database...")
    await db.connect()
    logger.info("Database connected.")
    start_scheduler(app)
    yield
    stop_scheduler(app)
    logger.info("IRIS backend shutting down — disconnecting from database...")
    await db.disconnect()


app = FastAPI(
    title="IRIS Insurance Bridge API",
    description=(
        "Settlement layer connecting Real-World Insurance APIs to Solana escrows. "
        "Users pay premiums on-chain; payouts are released automatically on claim approval."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request timing
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed:.4f}"
    return response

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
app.include_router(v1_router)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "IRIS Insurance Bridge",
        "version": "1.0.0",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)