import uuid
import enum
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class TicketCategory(str, enum.Enum):
    plumbing = "plumbing"
    electrical = "electrical"
    carpentry = "carpentry"
    lift = "lift"
    cleaning = "cleaning"
    other = "other"

class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(Enum(TicketCategory), nullable=False)
    priority = Column(Enum(TicketPriority), default=TicketPriority.low, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.open, nullable=False)
    flat_number = Column(String, nullable=False)
    
    raised_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    raised_by_user = relationship("User", foreign_keys=[raised_by], back_populates="tickets_raised")
    assigned_to_user = relationship("User", foreign_keys=[assigned_to], back_populates="tickets_assigned")
