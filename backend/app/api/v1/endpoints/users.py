from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma

from app.api.deps import get_db
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(body: UserCreate, db: Prisma = Depends(get_db)):
    """Create a user record for a connected Solana wallet."""
    existing = await db.user.find_unique(where={"wallet": body.wallet})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Wallet already registered.",
        )
    return await db.user.create(data={"wallet": body.wallet, "email": body.email})


@router.get("/{wallet}", response_model=UserRead)
async def get_user_by_wallet(wallet: str, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"wallet": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.patch("/{wallet}", response_model=UserRead)
async def update_user(wallet: str, body: UserUpdate, db: Prisma = Depends(get_db)):
    data = body.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    try:
        return await db.user.update(where={"wallet": wallet}, data=data)
    except Exception:
        raise HTTPException(status_code=404, detail="User not found.")
