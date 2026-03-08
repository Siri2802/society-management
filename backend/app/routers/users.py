from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.schemas.user import UserOut, UserUpdate, UserListOut
from app.models.user import User, UserRole, UserStatus

router = APIRouter(prefix="/users", tags=["Users Users"])

@router.get("/", response_model=UserListOut, dependencies=[Depends(require_admin)])
async def list_users(
    skip: int = 0, limit: int = 100, 
    role: Optional[UserRole] = None, 
    status: Optional[UserStatus] = None,
    db: AsyncSession = Depends(get_db)):
    """Admin only: list all users."""
    query = select(User)
    count_query = select(User) # simplistic count, you'd usually import func
    
    if role:
        query = query.where(User.role == role)
    if status:
        query = query.where(User.status == status)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    # In a real app implement pagination count properly
    return {"total": len(users), "users": users}

@router.get("/{id}", response_model=UserOut, dependencies=[Depends(require_admin)])
async def get_user_detail(id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.patch("/{id}", response_model=UserOut, dependencies=[Depends(require_admin)])
async def update_user(id: UUID, user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def deactivate_user(id: UUID, db: AsyncSession = Depends(get_db)):
    """Soft delete by setting status to inactive"""
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.status = UserStatus.inactive
    await db.commit()
    return None
