import uuid
import enum
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class VisitorStatus(str, enum.Enum):
    pre_approved = "pre_approved"
    checked_in = "checked_in"
    checked_out = "checked_out"
    denied = "denied"

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    flat_number = Column(String, nullable=False)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(VisitorStatus), default=VisitorStatus.pre_approved, nullable=False)
    
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    requested_by_user = relationship("User", back_populates="visitors_requested")
