from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import Sequence
from uuid import UUID

from app.models.visitor import Visitor, VisitorStatus
from app.schemas.visitor import VisitorCreate
from app.models.user import User
from datetime import datetime
import pytz

async def create_visitor(data: VisitorCreate, current_user: User, db: AsyncSession) -> Visitor:
    """
    Creates a new pre-approved visitor record.
    If the current_user is a resident, they can only request for their own flat.
    """
    if current_user.role == "resident" and current_user.flat_number != data.flat_number:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Residents can only pre-approve visitors for their own flat."
        )

    visitor = Visitor(
        name=data.name,
        phone=data.phone,
        purpose=data.purpose,
        flat_number=data.flat_number,
        requested_by=current_user.id,
        status=VisitorStatus.pre_approved
    )
    db.add(visitor)
    await db.commit()
    await db.refresh(visitor)
    return visitor

async def update_visitor_status(visitor_id: UUID, new_status: VisitorStatus, db: AsyncSession) -> Visitor:
    """
    Transition a visitor's state. e.g., checked_in -> checked_out.
    Enforces valid state transitions.
    """
    result = await db.execute(select(Visitor).where(Visitor.id == visitor_id))
    visitor = result.scalars().first()

    if not visitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")

    current_status = visitor.status
    now = datetime.now(pytz.utc)

    # Simplified state machine validation
    if current_status == VisitorStatus.checked_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot change status of a checked-out visitor."
        )
    
    if current_status == VisitorStatus.pre_approved and new_status == VisitorStatus.checked_in:
        visitor.check_in_time = now
    elif current_status == VisitorStatus.checked_in and new_status == VisitorStatus.checked_out:
        visitor.check_out_time = now
    
    visitor.status = new_status
    await db.commit()
    await db.refresh(visitor)
    return visitor

async def get_visitors(current_user: User, db: AsyncSession, status_filter: VisitorStatus | None = None) -> Sequence[Visitor]:
    """
    Applies role-scoped filtering. Residents only see visitors for their flat.
    """
    query = select(Visitor)
    
    if current_user.role == "resident":
        query = query.where(Visitor.flat_number == current_user.flat_number)
        
    if status_filter:
        query = query.where(Visitor.status == status_filter)

    # Order by newest first
    query = query.order_by(Visitor.created_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()
