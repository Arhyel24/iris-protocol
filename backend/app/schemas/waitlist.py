from pydantic import BaseModel, EmailStr
from datetime import datetime


class WaitlistCreate(BaseModel):
    email: EmailStr
    wallet: str  # required — one wallet address per waitlist entry


class WaitlistRead(BaseModel):
    id: str
    email: str
    wallet: str | None
    status: str
    createdAt: datetime

    model_config = {"from_attributes": True}


class WaitlistUpdate(BaseModel):
    status: str | None = None
