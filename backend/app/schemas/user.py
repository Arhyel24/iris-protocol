from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    wallet: str
    email: EmailStr | None = None


class UserRead(BaseModel):
    id: str
    wallet: str
    email: str | None
    role: str
    createdAt: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    role: str | None = None
