from pydantic import BaseModel
from datetime import datetime


class ClaimCreate(BaseModel):
    policyId: str
    description: str
    incidentDate: datetime
    proofHash: str | None = None  # IPFS hash or on-chain proof reference


class ClaimRead(BaseModel):
    id: str
    policyId: str
    status: str
    description: str
    incidentDate: datetime
    proofHash: str | None
    payoutAmount: float | None
    payoutTxHash: str | None
    reviewedAt: datetime | None
    reviewNote: str | None
    createdAt: datetime

    model_config = {"from_attributes": True}


class ClaimReview(BaseModel):
    """Admin action: approve or reject a claim."""
    decision: str           # "approved" | "rejected"
    reviewNote: str | None = None
    payoutAmount: float | None = None  # required if approved
