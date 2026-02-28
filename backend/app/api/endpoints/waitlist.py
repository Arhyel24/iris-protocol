from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.core.db import db

router = APIRouter()

class WaitlistCreate(BaseModel):
    email: EmailStr

class WaitlistResponse(BaseModel):
    id: str
    email: str
    status: str

@router.post("/", response_model=WaitlistResponse)
async def join_waitlist(data: WaitlistCreate):
    try:
        # Check if email exists
        existing = await db.waitlist.find_unique(where={"email": data.email})
        if existing:
            return existing
            
        # Create new waitlist entry
        entry = await db.waitlist.create(
            data={
                "email": data.email,
                "status": "pending"
            }
        )
        return entry
    except Exception as e:
        import logging
        logging.error(f"Waitlist error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to join waitlist. Please try again later.")
