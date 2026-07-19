from datetime import datetime
from uuid import UUID
from typing import Optional, Literal
from pydantic import BaseModel


class NudgeBase(BaseModel):
    transaction_id: UUID
    customer_id: UUID
    message_text: str
    status: Literal["DRAFT", "SENT"] = "DRAFT"


class NudgeCreate(NudgeBase):
    pass


class NudgeRead(NudgeBase):
    id: UUID
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
