"""Shared FastAPI dependencies injected via Depends()."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from prisma.models import User

from app.core.db import db
from app.core.security import decode_access_token

beareer_scheme = HTTPBearer(auto_error=False)


async def get_db():
    """Yield the Prisma client; connect/disconnect handled by app lifespan."""
    return db


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(beareer_scheme),
) -> User:
    """
    Extract and validate the Bearer JWT from the Authorization header.
    Returns the authenticated User ORM object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception
    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        raise credentials_exception

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise credentials_exception
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Like get_current_user but also enforces role == 'admin'."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not found.",          # intentionally vague to obscure admin paths
        )
    return current_user


async def get_db():
    """Yield the Prisma client; connect/disconnect handled by app lifespan."""
    return db


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(beareer_scheme),
) -> User:
    """
    Extract and validate the Bearer JWT from the Authorization header.
    Returns the authenticated User ORM object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception
    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        raise credentials_exception

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise credentials_exception
    return user
