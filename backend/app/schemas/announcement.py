from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.models.announcement import AnnouncementTag
from datetime import datetime

class AnnouncementBase(BaseModel):
    title: str
    body: str
    tag: AnnouncementTag = AnnouncementTag.general
    pinned: bool = False

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    tag: Optional[AnnouncementTag] = None
    pinned: Optional[bool] = None

class AnnouncementOut(AnnouncementBase):
    id: UUID
    posted_by: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Resolved author name
    posted_by_name: Optional[str] = None

    class Config:
        from_attributes = True
