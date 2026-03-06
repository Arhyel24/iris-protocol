from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
from pydantic import BaseModel

from app.api.deps import get_db
from app.schemas.waitlist import WaitlistCreate, WaitlistRead, WaitlistUpdate

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


def _mask_email(email: str) -> str:
    """Return j***@example.com style masked email."""
    local, domain = email.split("@", 1)
    return local[0] + "***@" + domain


class WalletCheckResponse(BaseModel):
    registered: bool
    email_masked: str | None = None


@router.get("/check/{wallet}", response_model=WalletCheckResponse)
async def check_wallet(wallet: str, db: Prisma = Depends(get_db)):
    """Check if a wallet address is already on the waitlist."""
    entry = await db.waitlist.find_unique(where={"wallet": wallet})
    if entry:
        return WalletCheckResponse(registered=True, email_masked=_mask_email(entry.email))
    return WalletCheckResponse(registered=False)


@router.post("/", response_model=WaitlistRead, status_code=status.HTTP_201_CREATED)
async def join_waitlist(body: WaitlistCreate, db: Prisma = Depends(get_db)):
    """Register an email + wallet on the IRIS waitlist. One email and one wallet per entry."""
    existing_email = await db.waitlist.find_unique(where={"email": body.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already on the waitlist.",
        )
    existing_wallet = await db.waitlist.find_unique(where={"wallet": body.wallet})
    if existing_wallet:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This wallet is already on the waitlist.",
        )
    entry = await db.waitlist.create(
        data={
            "email": body.email,
            "wallet": body.wallet,
        }
    )
    return entry


@router.get("/", response_model=list[WaitlistRead])
async def list_waitlist(skip: int = 0, limit: int = 100, db: Prisma = Depends(get_db)):
    """[Admin] List all waitlist entries."""
    return await db.waitlist.find_many(skip=skip, take=limit, order={"createdAt": "desc"})


@router.get("/{entry_id}", response_model=WaitlistRead)
async def get_waitlist_entry(entry_id: str, db: Prisma = Depends(get_db)):
    entry = await db.waitlist.find_unique(where={"id": entry_id})
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found.")
    return entry


@router.patch("/{entry_id}", response_model=WaitlistRead)
async def update_waitlist_entry(
    entry_id: str, body: WaitlistUpdate, db: Prisma = Depends(get_db)
):
    """[Admin] Update status or wallet of a waitlist entry."""
    data = body.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    try:
        return await db.waitlist.update(where={"id": entry_id}, data=data)
    except Exception:
        raise HTTPException(status_code=404, detail="Waitlist entry not found.")
