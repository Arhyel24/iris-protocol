"""
IRIS Protocol - Insurance Bridge Backend
"""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import insurance, waitlist
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.db import db

# Set up logging
logger = setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Connecting to Prisma database...")
    await db.connect()
    yield
    # Shutdown
    logger.info("Disconnecting from Prisma database...")
    await db.disconnect()

# Create FastAPI application
app = FastAPI(
    title="IRIS Insurance Bridge",
    description="Bridge connecting Web2 Insurance APIs to Solana Escrows",
    version="0.2.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Request processed in {process_time:.3f} seconds")
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include routers
app.include_router(insurance.router, prefix="/api/v1/insurance", tags=["insurance"])
app.include_router(waitlist.router, prefix="/api/v1/waitlist", tags=["waitlist"])

@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "IRIS Insurance Bridge", "version": "0.2.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)