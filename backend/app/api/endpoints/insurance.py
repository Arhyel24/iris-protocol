import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.core.db import db

router = APIRouter()
logger = logging.getLogger(__name__)

# Request Models
class QuoteRequest(BaseModel):
    product_type: str # e.g. "flight", "gadget"
    coverage_amount: float
    user_wallet: str

class PolicyRequest(BaseModel):
    quote_id: str
    user_wallet: str
    duration_days: int

class ClaimRequest(BaseModel):
    policy_id: str
    incident_date: str
    description: str
    proof_hash: Optional[str] = None

# Mock functions for the Web2 Insurance API
@router.post("/quote", summary="Get an insurance quote")
async def get_quote(request: QuoteRequest):
    """Fetch a quote from the Web2 Insurance API (e.g. Qover)."""
    # In a real implementation, this would call out to the Qover/Boost API.
    # We return a mock stablecoin (USDC) premium based on coverage.
    premium = request.coverage_amount * 0.05
    
    # Ensure user exists
    user = await db.user.find_unique(where={"wallet": request.user_wallet})
    if not user:
        user = await db.user.create(data={"wallet": request.user_wallet})
        
    # Create quote in database
    quote = await db.quote.create(
        data={
            "userId": user.id,
            "type": request.product_type,
            "premium": round(premium, 2),
            "coverage": request.coverage_amount,
            "status": "pending"
        }
    )
    
    return {
        "quote_id": quote.id,
        "premium_usdc": quote.premium,
        "coverage_amount": quote.coverage,
        "product_type": quote.type
    }

@router.post("/policy", summary="Create a new policy")
async def create_policy(request: PolicyRequest):
    """Create a policy once the Sol payment is confirmed on-chain."""
    # The Oracle/Backend verifies the user locked USDC in the Escrow
    # Then it calls the Web2 API to bind the fiat policy
    # Find the quote to get pricing and type details
    quote = await db.quote.find_unique(where={"id": request.quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
        
    # Update quote to accepted
    await db.quote.update(where={"id": quote.id}, data={"status": "accepted"})
    
    # Create the active policy
    import datetime
    end_date = datetime.datetime.now() + datetime.timedelta(days=request.duration_days)
    
    policy_id = f"pol_{hash(request.quote_id + request.user_wallet) % 100000}"
    policy = await db.policy.create(
        data={
            "id": policy_id, # Or let the DB generate UUID
            "userId": quote.userId,
            "type": quote.type,
            "status": "active",
            "premium": quote.premium,
            "coverage": quote.coverage,
            "endDate": end_date
        }
    )
    
    return {
        "policy_id": policy.id,
        "status": policy.status,
        "user_wallet": request.user_wallet,
        "valid_until": policy.endDate.isoformat()
    }

def process_claim_background(policy_id: str, wallet: str, amount: float):
    """Background task to simulate Web2 claim assessment & trigger Solana payout."""
    import time
    time.sleep(2) # Simulate API delay
    logger.info(f"Claim for policy {policy_id} approved. Triggering Solana payout of {amount} USDC to {wallet}.")
    # Here we would use solana.py to sign a Tx with the Admin Key invoking `trigger_payout`
    pass

@router.post("/claim", summary="File an insurance claim")
async def file_claim(request: ClaimRequest, background_tasks: BackgroundTasks):
    """Submit a claim for an active policy."""
    # In a real app, the Web2 API reviews the proof and approves/denies.
    # We will assume a mock auto-approved logic for demo purposes.
    
    # Trigger background Web3 payout
    background_tasks.add_task(
        process_claim_background, 
        request.policy_id, 
        "UserWalletMock", 
        100.0 # Mock payout amount
    )
    
    return {
        "claim_id": f"clm_{hash(request.policy_id) % 100000}",
        "status": "processing",
        "message": "Claim submitted to Insurance Partner. Upon approval, USDC will be disbursed on-chain."
    }
