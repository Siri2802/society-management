from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.firebase import verify_firebase_token
from app.models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Extracts the Bearer token, verifies it via Firebase,
    and returns the corresponding user from the database.
    """
    token = credentials.credentials
    decoded_token = verify_firebase_token(token)
    uid = decoded_token.get("uid")
    
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Lookup user in DB
    result = await db.execute(select(User).where(User.firebase_uid == uid, User.status == "active"))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or inactive")

    return user

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that ensures the current user has the 'admin' role.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user

async def require_staff_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that ensures the current user has the 'admin' or 'staff' role.
    """
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff or Admin privileges required")
    return current_user
