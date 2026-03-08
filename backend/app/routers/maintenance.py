from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff_or_admin, require_admin
from app.models.user import User
from app.models.maintenance import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.schemas.maintenance import TicketCreate, TicketOut, TicketStatusUpdate, TicketSummary
from app.services.maintenance_service import create_ticket, assign_ticket, resolve_ticket, get_tickets

router = APIRouter(prefix="/tickets", tags=["Maintenance"])

@router.get("/", response_model=List[TicketOut])
async def list_tickets(
    status: TicketStatus | None = None,
    priority: TicketPriority | None = None,
    category: TicketCategory | None = None,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """List all tickets. residents see only their own."""
    return await get_tickets(current_user, db, status, priority, category)

@router.post("/", response_model=TicketOut)
async def raise_ticket(
    data: TicketCreate,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Resident raises a ticket."""
    return await create_ticket(data, current_user, db)

@router.patch("/{id}", response_model=TicketOut)
async def update_ticket(
    id: UUID,
    data: TicketStatusUpdate,
    current_user: User = Depends(require_staff_or_admin), 
    db: AsyncSession = Depends(get_db)
):
    """Staff/Admin updates ticket (assigning or resolving)."""
    if data.assigned_to and data.status == TicketStatus.in_progress:
        return await assign_ticket(id, data.assigned_to, db)
    elif data.status == TicketStatus.resolved:
        return await resolve_ticket(id, db)
    else:
        # Fallback for generic status update
        result = await db.execute(select(Ticket).where(Ticket.id == id))
        ticket = result.scalars().first()
        if not ticket:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        ticket.status = data.status
        await db.commit()
        await db.refresh(ticket)
        return ticket

@router.get("/summary", response_model=TicketSummary)
async def tickets_summary(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    query = select(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status)
    if current_user.role == "resident":
        query = query.where(Ticket.raised_by == current_user.id)
        
    result = await db.execute(query)
    counts = result.all()
    
    summary = TicketSummary()
    for row in counts:
        setattr(summary, row.status, row.count)
    return summary

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_ticket(id: UUID, db: AsyncSession = Depends(get_db)):
    """Admin hard deletes a ticket."""
    result = await db.execute(select(Ticket).where(Ticket.id == id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        
    await db.delete(ticket)
    await db.commit()
    return None
