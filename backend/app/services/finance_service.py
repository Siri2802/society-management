from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import Sequence
from uuid import UUID
from datetime import datetime
import pytz

from app.models.finance import Bill, Payment, BillStatus
from app.schemas.finance import PaymentCreate
from app.models.user import User

async def get_bills_for_user(user_id: UUID, db: AsyncSession) -> Sequence[Bill]:
    """Fetches all bills for a specific resident."""
    result = await db.execute(select(Bill).where(Bill.user_id == user_id).order_by(Bill.due_date.desc()))
    return result.scalars().all()

async def get_all_bills(db: AsyncSession, flat_filter: str | None = None, status_filter: BillStatus | None = None, month_filter: str | None = None) -> Sequence[Bill]:
    """Admin-scoped query fetching all bills across flats."""
    query = select(Bill)
    if flat_filter:
        query = query.where(Bill.flat_number == flat_filter)
    if status_filter:
        query = query.where(Bill.status == status_filter)
    if month_filter:
        query = query.where(Bill.month == month_filter)
        
    query = query.order_by(Bill.due_date.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def record_payment(bill_id: UUID, payment_data: PaymentCreate, current_user: User, db: AsyncSession) -> Payment:
    """
    Creates a Payment row and updates the corresponding Bill status to paid.
    """
    if bill_id != payment_data.bill_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bill ID mismatch in payload")
        
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalars().first()

    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.status == BillStatus.paid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bill is already paid")

    # Authorize: Resident can only pay their own bills
    if current_user.role == "resident" and bill.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot pay bills for other residents")

    # Ensure paid amount is exactly the bill amount (simplification for this project)
    if payment_data.amount != bill.amount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Payment amount must match the bill amount exactly: {bill.amount}")

    payment = Payment(
        bill_id=bill.id,
        paid_by=current_user.id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        transaction_id=payment_data.transaction_id
    )
    db.add(payment)
    
    bill.status = BillStatus.paid
    
    await db.commit()
    await db.refresh(payment)
    return payment

async def generate_monthly_bills(month: str, amount: float, due_date: datetime, db: AsyncSession) -> int:
    """
    Admin-triggered logic to create one Bill row per active resident for the given month.
    Returns the number of bills created.
    """
    # Find all active residents
    residents_result = await db.execute(
        select(User).where(User.role == "resident", User.status == "active", User.flat_number != None)
    )
    residents = residents_result.scalars().all()

    created_count = 0
    for resident in residents:
        # Check if Bill already exists for this month/resident
        existing_bill = await db.execute(
            select(Bill).where(Bill.user_id == resident.id, Bill.month == month)
        )
        if not existing_bill.scalars().first():
            new_bill = Bill(
                flat_number=resident.flat_number,
                user_id=resident.id,
                description=f"Monthly Maintenance - {month}",
                amount=amount,
                month=month,
                due_date=due_date,
                status=BillStatus.pending
            )
            db.add(new_bill)
            created_count += 1

    await db.commit()
    return created_count
