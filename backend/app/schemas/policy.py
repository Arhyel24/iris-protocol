from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PolicyCreate(BaseModel):
    quoteId: str
    premiumTxHash: str             # Solana tx confirming premium payment
    escrowAccount: Optional[str] = None   # PolicyState PDA address
    monthlyPremium: Optional[float] = None
    durationMonths: Optional[int] = None


class PolicyRead(BaseModel):
    id: str
    userId: str
    quoteId: str
    productType: str
    coverageAmount: float
    premiumAmount: float
    monthlyPremium: float
    durationMonths: int
    paymentsCount: int
    nextPaymentDue: Optional[datetime]
    currency: str
    status: str
    startDate: datetime
    endDate: datetime
    premiumTxHash: Optional[str]
    escrowAccount: Optional[str]
    insuranceRef: Optional[str]
    createdAt: datetime

    model_config = {"from_attributes": True}


class PolicyCancel(BaseModel):
    reason: Optional[str] = None
