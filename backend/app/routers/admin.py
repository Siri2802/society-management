from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User, UserRole, UserStatus
from app.models.maintenance import Ticket, TicketStatus
from app.models.finance import Bill, BillStatus
from app.models.visitor import Visitor

from pydantic import BaseModel

class AdminStats(BaseModel):
    total_residents: int
    open_tickets: int
    pending_dues: float
    visitors_today: int

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"], dependencies=[Depends(require_admin)])

@router.get("/stats", response_model=AdminStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Returns aggregate stats used in the dashboard."""
    
    # Total residents
    res = await db.execute(select(func.count(User.id)).where(User.role == UserRole.resident, User.status == UserStatus.active))
    total_residents = res.scalar() or 0
    
    # Open tickets
    res = await db.execute(select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.open))
    open_tickets = res.scalar() or 0
    
    # Pending Dues (Sum of amounts of pending/overdue bills)
    res = await db.execute(select(func.sum(Bill.amount)).where(Bill.status != BillStatus.paid))
    pending_dues = res.scalar() or 0.0
    
    # Visitors Today (Simplification: using a naive count for now, proper implementation would filter by today's date)
    # import datetime, pytz
    # today_start = datetime.datetime.now(pytz.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    res = await db.execute(select(func.count(Visitor.id)))
    visitors_today = res.scalar() or 0

    return AdminStats(
        total_residents=total_residents,
        open_tickets=open_tickets,
        pending_dues=pending_dues,
        visitors_today=visitors_today
    )

@router.get("/health")
async def health_check():
    """Basic system health check (DB connectivity verified by Depends(get_db))."""
    return {"status": "healthy"}
