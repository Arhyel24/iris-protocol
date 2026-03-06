from fastapi import APIRouter

from app.api.v1.endpoints import auth, waitlist, users, quotes, policies, claims, admin

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(waitlist.router)
router.include_router(users.router)
router.include_router(quotes.router)
router.include_router(policies.router)
router.include_router(claims.router)

# Admin portal — prefix intentionally opaque; hidden from OpenAPI schema/docs
from fastapi import APIRouter as _AR
_admin_router = _AR(prefix="/x-iris-ops/v1")
_admin_router.include_router(admin.router)
router.include_router(_admin_router, include_in_schema=False)
