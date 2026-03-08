from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff_or_admin
from app.models.user import User
from app.models.visitor import Visitor, VisitorStatus
from app.schemas.visitor import VisitorCreate, VisitorOut, VisitorStatusUpdate, VisitorSummary
from app.services.visitor_service import create_visitor, update_visitor_status, get_visitors

router = APIRouter(prefix="/visitors", tags=["Visitor Management"])

@router.get("/", response_model=List[VisitorOut])
async def list_visitors(
    status: VisitorStatus | None = None,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """List all visitors (filterable). Residents see only theirs."""
    return await get_visitors(current_user, db, status_filter=status)

@router.post("/", response_model=VisitorOut)
async def new_visitor(
    data: VisitorCreate,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Resident pre-approves a visitor."""
    return await create_visitor(data, current_user, db)

@router.patch("/{id}/status", response_model=VisitorOut)
async def change_visitor_status(
    id: UUID,
    data: VisitorStatusUpdate,
    # Only staff/admin can change status from pre_approved to checked_in/out
    current_user: User = Depends(require_staff_or_admin), 
    db: AsyncSession = Depends(get_db)
):
    """Staff or admin transitions visitor status."""
    return await update_visitor_status(id, data.status, db)

@router.get("/summary", response_model=VisitorSummary)
async def visitors_summary(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Count of visitors grouped by status."""
    query = select(Visitor.status, func.count(Visitor.id)).group_by(Visitor.status)
    
    # Roll scoped
    if current_user.role == "resident":
        query = query.where(Visitor.flat_number == current_user.flat_number)
        
    result = await db.execute(query)
    counts = result.all()
    
    summary = VisitorSummary()
    for row in counts:
        setattr(summary, row.status, row.count)
    return summary
