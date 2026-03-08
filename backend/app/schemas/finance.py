from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.models.finance import BillStatus
from datetime import datetime

# ====================
# Bill Schemas
# ====================
class BillBase(BaseModel):
    flat_number: str
    description: str
    amount: float
    month: str # e.g., "2023-10"
    due_date: datetime

class BillCreate(BillBase):
    user_id: UUID

class BillOut(BillBase):
    id: UUID
    user_id: UUID
    status: BillStatus
    created_at: datetime
    
    # We might want to resolve the resident name in the response
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class BillStatusUpdate(BaseModel):
    status: BillStatus

# ====================
# Payment Schemas
# ====================
class PaymentBase(BaseModel):
    payment_method: str
    transaction_id: Optional[str] = None
    amount: float

class PaymentCreate(PaymentBase):
    bill_id: UUID

class PaymentOut(PaymentBase):
    id: UUID
    bill_id: UUID
    paid_by: UUID
    paid_at: datetime
    
    # We might want to resolve bill and user info in a full dump
    bill_month: Optional[str] = None
    paid_by_name: Optional[str] = None

    class Config:
        from_attributes = True

# ====================
# Summary
# ====================
class FinanceSummary(BaseModel):
    total_collected: float = 0.0
    total_pending: float = 0.0
    total_overdue: float = 0.0
