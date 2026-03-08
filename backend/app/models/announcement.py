import uuid
import enum
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Enum, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class AnnouncementTag(str, enum.Enum):
    general = "general"
    meeting = "meeting"
    maintenance = "maintenance"
    event = "event"
    notice = "notice"

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    tag = Column(Enum(AnnouncementTag), default=AnnouncementTag.general, nullable=False)
    pinned = Column(Boolean, default=False, nullable=False)
    
    posted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    posted_by_user = relationship("User", back_populates="announcements_posted")
