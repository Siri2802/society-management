from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.finance import Bill, Payment, BillStatus
from app.schemas.finance import BillOut, PaymentCreate, PaymentOut, FinanceSummary
from app.services.finance_service import get_bills_for_user, get_all_bills, record_payment

router = APIRouter(tags=["Finance"])

@router.get("/bills", response_model=List[BillOut])
async def list_bills(
    flat_number: str | None = None,
    status: BillStatus | None = None,
    month: str | None = None,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Get bills (admin sees all via filters, resident sees own)"""
    if current_user.role == "resident":
        return await get_bills_for_user(current_user.id, db)
    else:
        return await get_all_bills(db, flat_number, status, month)

@router.get("/bills/summary", response_model=FinanceSummary, dependencies=[Depends(require_admin)])
async def bills_summary(db: AsyncSession = Depends(get_db)):
    """Admin only: aggregate totals."""
    query = select(Bill.status, func.sum(Bill.amount).label("total")).group_by(Bill.status)
    result = await db.execute(query)
    totals = result.all()
    
    summary = FinanceSummary()
    for row in totals:
        if row.status == BillStatus.paid:
            summary.total_collected = row.total or 0.0
        elif row.status == BillStatus.pending:
            summary.total_pending = row.total or 0.0
        elif row.status == BillStatus.overdue:
            summary.total_overdue = row.total or 0.0
            
    return summary

@router.post("/payments", response_model=PaymentOut)
async def pay_bill(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Resident submits a payment."""
    return await record_payment(data.bill_id, data, current_user, db)

@router.get("/payments/{bill_id}", response_model=PaymentOut)
async def get_payment_receipt(
    bill_id: UUID,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Fetch receipt for a specific bill."""
    result = await db.execute(select(Payment).where(Payment.bill_id == bill_id))
    payment = result.scalars().first()
    
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")
        
    if current_user.role == "resident" and payment.paid_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view other residents' receipts")
        
    return payment
