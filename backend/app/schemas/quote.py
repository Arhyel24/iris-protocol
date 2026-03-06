from pydantic import BaseModel
from datetime import datetime
from typing import Any


class QuoteCreate(BaseModel):
    productType: str          # e.g. "flight", "gadget", "travel"
    coverageAmount: float
    currency: str = "USDC"
    details: dict[str, Any] | None = None  # extra params forwarded to insurance API


class QuoteRead(BaseModel):
    id: str
    userId: str
    productType: str
    coverageAmount: float
    premiumAmount: float
    currency: str
    insuranceRef: str | None
    status: str
    expiresAt: datetime | None
    createdAt: datetime

    model_config = {"from_attributes": True}


class QuoteUpdate(BaseModel):
    status: str | None = None
