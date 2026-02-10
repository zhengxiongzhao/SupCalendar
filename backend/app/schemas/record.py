from pydantic import BaseModel
from datetime import datetime
from app.models.base import RecordType, PeriodType, Direction


class SimpleRecordCreate(BaseModel):
    name: str
    time: datetime
    period: PeriodType
    description: str | None = None


class PaymentRecordCreate(BaseModel):
    name: str
    description: str | None = None
    direction: Direction
    category: str
    amount: float
    payment_method: str
    period: PeriodType
    start_time: datetime
    end_time: datetime | None = None
    notes: str | None = None
    currency: str = "CNY"


class SimpleRecordUpdate(BaseModel):
    name: str
    time: datetime
    period: PeriodType
    description: str | None = None


class PaymentRecordUpdate(BaseModel):
    name: str
    description: str | None = None
    direction: Direction
    category: str
    amount: float
    payment_method: str
    period: PeriodType
    start_time: datetime
    end_time: datetime | None = None
    notes: str | None = None
    currency: str = "CNY"


class CustomRecordCreate(BaseModel):
    template_id: str
    custom_fields: dict


class RecordResponse(BaseModel):
    id: str
    type: RecordType
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class SimpleRecordResponse(RecordResponse):
    type: RecordType = RecordType.SIMPLE
    name: str
    time: datetime
    period: PeriodType
    description: str | None


class PaymentRecordResponse(RecordResponse):
    type: RecordType = RecordType.PAYMENT
    name: str
    description: str | None
    direction: Direction
    category: str
    amount: float
    payment_method: str
    period: PeriodType
    start_time: datetime
    end_time: datetime | None
    notes: str | None
    currency: str
