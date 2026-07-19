from datetime import datetime
from uuid import UUID
from typing import Optional, Literal
from pydantic import BaseModel, condecimal


class TransactionBase(BaseModel):
    customer_id: UUID
    amount: condecimal(max_digits=14, decimal_places=2)
    type: Literal["CREDIT", "DEBIT"]
    description: Optional[str] = None
    voice_url: Optional[str] = None
    status: Literal["PENDING", "CONFIRMED"] = "PENDING"


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: UUID
    business_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
