from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import Sequence
from uuid import UUID

from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate
from app.models.user import User

async def create_announcement(data: AnnouncementCreate, current_user: User, db: AsyncSession) -> Announcement:
    """Creates the announcement and links it to the posting admin."""
    announcement = Announcement(
        title=data.title,
        body=data.body,
        tag=data.tag,
        pinned=data.pinned,
        posted_by=current_user.id
    )
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement

async def toggle_pin(announcement_id: UUID, db: AsyncSession) -> Announcement:
    """Flips the pinned boolean flag."""
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    announcement = result.scalars().first()

    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    announcement.pinned = not announcement.pinned
    await db.commit()
    await db.refresh(announcement)
    return announcement

async def get_announcements(db: AsyncSession) -> Sequence[Announcement]:
    """Returns all announcements ordered by pinned DESC, created_at DESC."""
    query = select(Announcement).order_by(Announcement.pinned.desc(), Announcement.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()
