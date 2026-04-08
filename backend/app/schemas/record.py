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
    category: list[str] | None = None
    amount: float
    payment_method: list[str] | None = None
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
    category: list[str] | None = None
    amount: float
    payment_method: list[str] | None = None
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
    next_occurrence: datetime | None


class PaymentRecordResponse(RecordResponse):
    type: RecordType = RecordType.PAYMENT
    name: str
    description: str | None
    direction: Direction
    category: list[str] | None
    amount: float
    payment_method: list[str] | None
    period: PeriodType
    start_time: datetime
    end_time: datetime | None
    notes: str | None
    currency: str
    next_occurrence: datetime | None

    class Config:
        orm_mode = True

    @classmethod
    def from_orm(cls, obj):
        import json

        data = {
            "id": obj.id,
            "type": obj.type,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
            "name": obj.name,
            "description": obj.description,
            "direction": obj.direction,
            "amount": obj.amount,
            "period": obj.period,
            "start_time": obj.start_time,
            "end_time": obj.end_time,
            "notes": obj.notes,
            "currency": obj.currency,
            "next_occurrence": obj.next_occurrence,
        }
        if obj.category:
            try:
                data["category"] = (
                    json.loads(obj.category)
                    if isinstance(obj.category, str)
                    else obj.category
                )
            except:
                data["category"] = [obj.category]
        else:
            data["category"] = None

        if obj.payment_method:
            try:
                data["payment_method"] = (
                    json.loads(obj.payment_method)
                    if isinstance(obj.payment_method, str)
                    else obj.payment_method
                )
            except:
                data["payment_method"] = [obj.payment_method]
        else:
            data["payment_method"] = None

        return cls(**data)
