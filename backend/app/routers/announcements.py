from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementOut, AnnouncementUpdate
from app.services.announcement_service import create_announcement, get_announcements, toggle_pin

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("/", response_model=List[AnnouncementOut])
async def list_announcements(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """All users can read announcements."""
    return await get_announcements(db)

@router.post("/", response_model=AnnouncementOut, dependencies=[Depends(require_admin)])
async def post_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Admin creates announcement."""
    return await create_announcement(data, current_user, db)

@router.patch("/{id}", response_model=AnnouncementOut, dependencies=[Depends(require_admin)])
async def update_announcement(
    id: UUID,
    data: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Admin edits or toggles pin."""
    if data.pinned is not None and not any([data.title, data.body, data.tag]):
        # Just toggling pin
        return await toggle_pin(id, db)
        
    # Full edit
    result = await db.execute(select(Announcement).where(Announcement.id == id))
    anncmt = result.scalars().first()
    if not anncmt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(anncmt, key, value)
        
    await db.commit()
    await db.refresh(anncmt)
    return anncmt

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_announcement(id: UUID, db: AsyncSession = Depends(get_db)):
    """Admin deletes an announcement."""
    result = await db.execute(select(Announcement).where(Announcement.id == id))
    anncmt = result.scalars().first()
    if not anncmt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
        
    await db.delete(anncmt)
    await db.commit()
    return None
