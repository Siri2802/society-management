from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from app.models.user import UserRole, UserStatus
from datetime import datetime

class UserBase(BaseModel):
    name: str
    flat_number: Optional[str] = None
    role: UserRole = UserRole.resident

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    flat_number: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None

class UserOut(UserBase):
    id: UUID
    email: Optional[EmailStr] = None
    status: UserStatus
    created_at: datetime

    class Config:
        from_attributes = True

class UserListOut(BaseModel):
    total: int
    users: list[UserOut]
