from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.record import (
    SimpleRecordCreate,
    PaymentRecordCreate,
    CustomRecordCreate,
    SimpleRecordResponse,
    PaymentRecordResponse,
    SimpleRecordUpdate,
    PaymentRecordUpdate,
)
from app.models.record import BaseRecord, SimpleRecord, PaymentRecord, CustomRecord

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


@router.get("", response_model=list[SimpleRecordResponse | PaymentRecordResponse])
def get_records(db: Session = Depends(get_db)):
    records = db.query(BaseRecord).order_by(BaseRecord.created_at.desc()).all()
    return records


@router.get("/{record_id}")
def get_record(record_id: str, db: Session = Depends(get_db)):
    record = db.query(BaseRecord).filter(BaseRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.delete("/{record_id}")
def delete_record(record_id: str, db: Session = Depends(get_db)):
    record = db.query(BaseRecord).filter(BaseRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted"}


@router.put("/simple/{record_id}", response_model=SimpleRecordResponse)
def update_simple_record(
    record_id: str, data: SimpleRecordUpdate, db: Session = Depends(get_db)
):
    record = db.query(SimpleRecord).filter(SimpleRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record.name = data.name
    record.time = data.time
    record.period = data.period
    record.description = data.description

    db.commit()
    db.refresh(record)
    return record


@router.put("/payment/{record_id}", response_model=PaymentRecordResponse)
def update_payment_record(
    record_id: str, data: PaymentRecordUpdate, db: Session = Depends(get_db)
):
    record = db.query(PaymentRecord).filter(PaymentRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record.name = data.name
    record.description = data.description
    record.direction = data.direction
    record.category = data.category
    record.amount = data.amount
    record.payment_method = data.payment_method
    record.period = data.period
    record.start_time = data.start_time
    record.end_time = data.end_time
    record.notes = data.notes

    db.commit()
    db.refresh(record)
    return record
