from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from app.models.maintenance import TicketCategory, TicketPriority, TicketStatus
from datetime import datetime

class TicketBase(BaseModel):
    title: str
    description: str
    category: TicketCategory
    priority: TicketPriority = TicketPriority.low

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None

class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    assigned_to: Optional[UUID] = None

class TicketOut(TicketBase):
    id: UUID
    status: TicketStatus
    flat_number: str
    raised_by: UUID
    assigned_to: Optional[UUID] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TicketFilter(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    category: Optional[TicketCategory] = None

class TicketSummary(BaseModel):
    open: int = 0
    in_progress: int = 0
    resolved: int = 0
    closed: int = 0
