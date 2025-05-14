"""
IRIS AI Risk Engine - Main FastAPI Application
"""
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import evaluate, explain
from app.core.config import settings
from app.core.logging import setup_logging

# Set up logging
logger = setup_logging()

# Create FastAPI application
app = FastAPI(
    title="IRIS AI Risk Engine",
    description="Real-time risk assessment for on-chain wallets",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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
app.include_router(evaluate.router, prefix="/api/v1", tags=["risk"])
app.include_router(explain.router, prefix="/api/v1", tags=["explanation"])

@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "IRIS AI Risk Engine", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



# uvicorn app.main:app --reload