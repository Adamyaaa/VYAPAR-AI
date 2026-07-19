from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, condecimal


class CustomerBase(BaseModel):
    name: str
    phone_number: Optional[str] = None
    current_balance: condecimal(max_digits=14, decimal_places=2) = 0.00


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: UUID
    business_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
