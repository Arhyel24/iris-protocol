from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Json, Prisma
from prisma.models import User

from app.api.deps import get_db, get_current_user
from app.schemas.quote import QuoteCreate, QuoteRead
from app.services.insurance_api import get_insurance_service

router = APIRouter(prefix="/quotes", tags=["Quotes"])


@router.post("/", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
async def request_quote(
    body: QuoteCreate,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Request a price quote. Authenticated user's id is used automatically."""
    svc = get_insurance_service()
    quote_data = await svc.get_quote(
        product_type=body.productType,
        coverage_amount=body.coverageAmount,
        currency=body.currency,
        details=body.details,
    )
    create_data: dict = {
        "userId": current_user.id,
        "productType": body.productType,
        "coverageAmount": body.coverageAmount,
        "premiumAmount": quote_data.premium_amount,
        "currency": body.currency,
        "insuranceRef": quote_data.ref,
        "expiresAt": quote_data.expires_at,
    }
    if quote_data.raw is not None:
        create_data["details"] = Json(quote_data.raw)
    return await db.quote.create(data=create_data)


@router.get("/me", response_model=list[QuoteRead])
async def list_my_quotes(
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all quotes for the authenticated user."""
    return await db.quote.find_many(
        where={"userId": current_user.id},
        order={"createdAt": "desc"},
    )


@router.get("/{quote_id}", response_model=QuoteRead)
async def get_quote(
    quote_id: str,
    db: Prisma = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = await db.quote.find_unique(where={"id": quote_id})
    if not record:
        raise HTTPException(status_code=404, detail="Quote not found.")
    if record.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return record
