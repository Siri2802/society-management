from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import Sequence
from uuid import UUID
from datetime import datetime
import pytz

from app.models.maintenance import Ticket, TicketStatus, TicketPriority, TicketCategory
from app.schemas.maintenance import TicketCreate
from app.models.user import User

async def create_ticket(data: TicketCreate, current_user: User, db: AsyncSession) -> Ticket:
    """
    Resident creates a ticket linked to their flat.
    """
    if not current_user.flat_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resident must have a flat number assigned to raise tickets."
        )

    ticket = Ticket(
        title=data.title,
        description=data.description,
        category=data.category,
        priority=data.priority,
        flat_number=current_user.flat_number,
        raised_by=current_user.id,
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket

async def assign_ticket(ticket_id: UUID, staff_user_id: UUID, db: AsyncSession) -> Ticket:
    """
    Assign a ticket to a staff member and update status to in_progress.
    """
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Verify staff user exists
    staff_result = await db.execute(select(User).where(User.id == staff_user_id, User.role == "staff"))
    if not staff_result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assigned user is not valid staff.")

    ticket.assigned_to = staff_user_id
    ticket.status = TicketStatus.in_progress
    await db.commit()
    await db.refresh(ticket)
    return ticket

async def resolve_ticket(ticket_id: UUID, db: AsyncSession) -> Ticket:
    """
    Sets status to resolved and records resolved_at timestamp.
    """
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    ticket.status = TicketStatus.resolved
    ticket.resolved_at = datetime.now(pytz.utc)
    
    await db.commit()
    await db.refresh(ticket)
    return ticket

async def get_tickets(current_user: User, db: AsyncSession, 
                      status_filter: TicketStatus | None = None,
                      priority_filter: TicketPriority | None = None,
                      category_filter: TicketCategory | None = None) -> Sequence[Ticket]:
    """
    Role-scoped query handling. Residents see only their own tickets.
    """
    query = select(Ticket)
    
    if current_user.role == "resident":
        query = query.where(Ticket.raised_by == current_user.id)
        
    if status_filter:
        query = query.where(Ticket.status == status_filter)
    if priority_filter:
        query = query.where(Ticket.priority == priority_filter)
    if category_filter:
        query = query.where(Ticket.category == category_filter)

    query = query.order_by(Ticket.created_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()
