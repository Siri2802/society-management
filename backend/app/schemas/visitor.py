from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from app.models.visitor import VisitorStatus
from datetime import datetime

class VisitorBase(BaseModel):
    name: str
    phone: str
    purpose: str
    flat_number: str

class VisitorCreate(VisitorBase):
    pass

class VisitorStatusUpdate(BaseModel):
    status: VisitorStatus

class VisitorOut(VisitorBase):
    id: UUID
    requested_by: UUID
    status: VisitorStatus
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class VisitorSummary(BaseModel):
    pre_approved: int = 0
    checked_in: int = 0
    checked_out: int = 0
    denied: int = 0
