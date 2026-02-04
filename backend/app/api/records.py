from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.record import (
    SimpleRecordCreate,
    PaymentRecordCreate,
    SimpleRecordResponse,
    PaymentRecordResponse,
)
from app.models.record import SimpleRecord, PaymentRecord

router = APIRouter(prefix="/records", tags=["records"])


@router.post("/simple", response_model=SimpleRecordResponse)
def create_simple_record(data: SimpleRecordCreate, db: Session = Depends(get_db)):
    db_record = SimpleRecord(
        name=data.name, time=data.time, period=data.period, description=data.description
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.post("/payment", response_model=PaymentRecordResponse)
def create_payment_record(data: PaymentRecordCreate, db: Session = Depends(get_db)):
    db_record = PaymentRecord(
        name=data.name,
        description=data.description,
        direction=data.direction,
        category=data.category,
        amount=data.amount,
        payment_method=data.payment_method,
        period=data.period,
        start_time=data.start_time,
        end_time=data.end_time,
        notes=data.notes,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
