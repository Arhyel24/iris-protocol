from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AdminStats(BaseModel):
    totalUsers: int
    totalPolicies: int
    activePolicies: int
    pendingClaims: int
    approvedClaims: int
    rejectedClaims: int
    totalPremiumCollected: float   # sum of premiumAmount on all policies


class AdminUserRead(BaseModel):
    id: str
    wallet: str
    email: Optional[str]
    role: str
    createdAt: datetime
    policyCount: int
    claimCount: int

    model_config = {"from_attributes": True}


class AdminPolicyRead(BaseModel):
    id: str
    userId: str
    userWallet: str
    userEmail: Optional[str]
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


class AdminClaimRead(BaseModel):
    id: str
    policyId: str
    userId: str
    userWallet: str
    userEmail: Optional[str]
    productType: str
    coverageAmount: float
    status: str
    description: str
    incidentDate: datetime
    proofHash: Optional[str]
    payoutAmount: Optional[float]
    payoutTxHash: Optional[str]
    reviewedAt: Optional[datetime]
    reviewNote: Optional[str]
    escrowAccount: Optional[str]
    createdAt: datetime

    model_config = {"from_attributes": True}


class AdminClaimReview(BaseModel):
    decision: str                   # "approved" | "rejected"
    reviewNote: Optional[str] = None
    payoutAmount: Optional[float] = None   # required when approved
    adminSignature: Optional[str] = None   # base64 Ed25519 signature from admin wallet


class AdminUserRoleUpdate(BaseModel):
    role: str                       # "user" | "admin"


# ── OTP ───────────────────────────────────────────────────────────────────────

class OTPRequest(BaseModel):
    wallet: str    # admin wallet requesting OTP


class OTPVerify(BaseModel):
    wallet: str
    code: str      # 6-digit code


class OTPResponse(BaseModel):
    ok: bool
    message: str


# ── Chain Status ───────────────────────────────────────────────────────────────

class ChainStatus(BaseModel):
    oracleWallet: str
    oracleSolBalance: float
    treasuryPda: str
    treasuryUsdcBalance: float
    programId: str
    cluster: str


# ── Activity Log ───────────────────────────────────────────────────────────────

class ActivityLogEntry(BaseModel):
    id: str
    actor: str
    actorRole: str
    action: str
    targetId: Optional[str]
    targetType: Optional[str]
    metadata: Optional[dict]
    ipAddress: Optional[str]
    createdAt: datetime
