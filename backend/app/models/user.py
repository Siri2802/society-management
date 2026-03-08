import uuid
from sqlalchemy import Column, String, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    resident = "resident"
    admin = "admin"
    staff = "staff"

class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    flat_number = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.resident, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.active, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    visitors_requested = relationship("Visitor", back_populates="requested_by_user", cascade="all, delete-orphan")
    tickets_raised = relationship("Ticket", foreign_keys="[Ticket.raised_by]", back_populates="raised_by_user")
    tickets_assigned = relationship("Ticket", foreign_keys="[Ticket.assigned_to]", back_populates="assigned_to_user")
    bills = relationship("Bill", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="paid_by_user", cascade="all, delete-orphan")
    announcements_posted = relationship("Announcement", back_populates="posted_by_user")
