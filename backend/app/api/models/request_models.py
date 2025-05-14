"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from enum import Enum

class RiskAction(str, Enum):
    HOLD = "HOLD"
    BUY_COVER = "BUY_COVER"
    SWAP = "SWAP"

class TokenRisk(BaseModel):
    """Risk information for a specific token"""
    symbol: str
    risk_score: float = Field(..., ge=0, le=100)
    usd_value: float
    portfolio_percentage: float = Field(..., ge=0, le=100)
    volatility_24h: float
    liquidity_usd: Optional[float] = None
    age_days: float
    centralized_score: float = Field(..., ge=0, le=1)
    recommended_action: RiskAction

class WalletRiskRequest(BaseModel):
    """Request model for wallet risk evaluation"""
    wallet_address: str = Field(..., min_length=32, max_length=44)
    include_explanation: bool = False
    risk_threshold: Optional[float] = Field(None, ge=0, le=100)
    
    @validator('wallet_address')
    def validate_wallet_address(cls, v):
        # Basic Solana address validation
        if not v.startswith(('1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F')):
            raise ValueError("Invalid Solana wallet address format")
        return v

class BatchRiskRequest(BaseModel):
    """Request model for batch risk evaluation"""
    wallet_addresses: List[str] = Field(..., min_items=1, max_items=1000)
    include_explanation: bool = False
    risk_threshold: Optional[float] = Field(None, ge=0, le=100)

class WalletRiskResponse(BaseModel):
    """Response model for wallet risk evaluation"""
    wallet_address: str
    overall_risk_score: float = Field(..., ge=0, le=100)
    recommended_action: RiskAction
    at_risk_tokens: List[TokenRisk] = []
    safe_tokens: List[TokenRisk] = []
    timestamp: str
    processing_time_ms: float
    
class ExplanationRequest(BaseModel):
    """Request model for LLM explanation"""
    wallet_address: str
    risk_score: float = Field(..., ge=0, le=100)
    token_risks: List[TokenRisk]
    
class ExplanationResponse(BaseModel):
    """Response model for LLM explanation"""
    wallet_address: str
    overall_risk_score: float
    recommended_action: RiskAction
    at_risk_token: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1)
    reason: str
    suggestions: List[str]
    processing_time_ms: float
    
class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    details: Optional[Dict[str, Any]] = None