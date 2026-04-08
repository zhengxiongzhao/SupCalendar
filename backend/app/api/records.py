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
    from datetime import datetime
    from app.services.period_calculator import calculate_next_occurrence_from_now

    db_record = SimpleRecord(
        name=data.name, time=data.time, period=data.period, description=data.description
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    db_record.next_occurrence = calculate_next_occurrence_from_now(
        datetime.utcnow(), db_record.period, db_record.time
    )
    return db_record


@router.post("/payment")
def create_payment_record(data: PaymentRecordCreate, db: Session = Depends(get_db)):
    from datetime import datetime
    from app.services.period_calculator import calculate_next_occurrence_from_now
    from app.models.support import Category, PaymentMethod

    user_id = "default"

    category_objects = []
    if data.category:
        for cat_name in data.category:
            existing_category = (
                db.query(Category)
                .filter(Category.name == cat_name, Category.user_id == user_id)
                .first()
            )
            if not existing_category:
                existing_category = Category(name=cat_name, user_id=user_id)
                db.add(existing_category)
                db.flush()
            category_objects.append(existing_category)

    payment_method_objects = []
    if data.payment_method:
        for pm_name in data.payment_method:
            existing_method = (
                db.query(PaymentMethod)
                .filter(
                    PaymentMethod.name == pm_name,
                    PaymentMethod.user_id == user_id,
                )
                .first()
            )
            if not existing_method:
                existing_method = PaymentMethod(name=pm_name, user_id=user_id)
                db.add(existing_method)
                db.flush()
            payment_method_objects.append(existing_method)

    db_record = PaymentRecord(
        name=data.name,
        description=data.description,
        direction=data.direction,
        amount=data.amount,
        period=data.period,
        start_time=data.start_time,
        end_time=data.end_time,
        notes=data.notes,
        currency=data.currency,
        user_id=user_id,
    )
    db_record.categories = category_objects
    db_record.payment_methods = payment_method_objects

    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    db_record.next_occurrence = calculate_next_occurrence_from_now(
        datetime.utcnow(), db_record.period, db_record.start_time
    )

    return {
        "id": db_record.id,
        "type": db_record.type,
        "created_at": db_record.created_at.isoformat()
        if db_record.created_at
        else None,
        "updated_at": db_record.updated_at.isoformat()
        if db_record.updated_at
        else None,
        "name": db_record.name,
        "description": db_record.description,
        "direction": db_record.direction.value if db_record.direction else None,
        "category": [c.name for c in db_record.categories],
        "amount": db_record.amount,
        "payment_method": [pm.name for pm in db_record.payment_methods],
        "period": db_record.period.value if db_record.period else None,
        "start_time": db_record.start_time.isoformat()
        if db_record.start_time
        else None,
        "end_time": db_record.end_time.isoformat() if db_record.end_time else None,
        "notes": db_record.notes,
        "currency": db_record.currency,
        "next_occurrence": db_record.next_occurrence.isoformat()
        if db_record.next_occurrence
        else None,
    }


@router.get("", response_model=list[dict])
def get_records(db: Session = Depends(get_db)):
    import json
    from datetime import datetime
    from app.services.period_calculator import calculate_next_occurrence_from_now

    records = db.query(BaseRecord).order_by(BaseRecord.created_at.desc()).all()
    now = datetime.utcnow()
    result = []

    for record in records:
        record_dict = {
            "id": record.id,
            "type": record.type,
            "created_at": record.created_at.isoformat() if record.created_at else None,
            "updated_at": record.updated_at.isoformat() if record.updated_at else None,
        }

        if isinstance(record, SimpleRecord):
            record_dict.update(
                {
                    "name": record.name,
                    "time": record.time.isoformat() if record.time else None,
                    "period": record.period.value if record.period else None,
                    "description": record.description,
                }
            )
            record.next_occurrence = calculate_next_occurrence_from_now(
                now, record.period, record.time
            )
            record_dict["next_occurrence"] = (
                record.next_occurrence.isoformat() if record.next_occurrence else None
            )

        elif isinstance(record, PaymentRecord):
            record_dict.update(
                {
                    "name": record.name,
                    "description": record.description,
                    "direction": record.direction.value if record.direction else None,
                    "amount": record.amount,
                    "period": record.period.value if record.period else None,
                    "start_time": record.start_time.isoformat()
                    if record.start_time
                    else None,
                    "end_time": record.end_time.isoformat()
                    if record.end_time
                    else None,
                    "notes": record.notes,
                    "currency": record.currency,
                }
            )
            record.next_occurrence = calculate_next_occurrence_from_now(
                now, record.period, record.start_time
            )
            record_dict["next_occurrence"] = (
                record.next_occurrence.isoformat() if record.next_occurrence else None
            )

            record_dict["category"] = (
                [c.name for c in record.categories] if record.categories else None
            )
            record_dict["payment_method"] = (
                [pm.name for pm in record.payment_methods]
                if record.payment_methods
                else None
            )

        result.append(record_dict)

    return result


@router.get("/{record_id}", response_model=dict)
def get_record(record_id: str, db: Session = Depends(get_db)):
    import json
    from datetime import datetime
    from app.services.period_calculator import calculate_next_occurrence_from_now

    record = db.query(BaseRecord).filter(BaseRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    now = datetime.utcnow()
    record_dict = {
        "id": record.id,
        "type": record.type,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "updated_at": record.updated_at.isoformat() if record.updated_at else None,
    }

    if isinstance(record, SimpleRecord):
        record_dict.update(
            {
                "name": record.name,
                "time": record.time.isoformat() if record.time else None,
                "period": record.period.value if record.period else None,
                "description": record.description,
            }
        )
        record.next_occurrence = calculate_next_occurrence_from_now(
            now, record.period, record.time
        )
        record_dict["next_occurrence"] = (
            record.next_occurrence.isoformat() if record.next_occurrence else None
        )

    elif isinstance(record, PaymentRecord):
        record_dict.update(
            {
                "name": record.name,
                "description": record.description,
                "direction": record.direction.value if record.direction else None,
                "amount": record.amount,
                "period": record.period.value if record.period else None,
                "start_time": record.start_time.isoformat()
                if record.start_time
                else None,
                "end_time": record.end_time.isoformat() if record.end_time else None,
                "notes": record.notes,
                "currency": record.currency,
            }
        )
        record.next_occurrence = calculate_next_occurrence_from_now(
            now, record.period, record.start_time
        )
        record_dict["next_occurrence"] = (
            record.next_occurrence.isoformat() if record.next_occurrence else None
        )

        record_dict["category"] = (
            [c.name for c in record.categories] if record.categories else None
        )
        record_dict["payment_method"] = (
            [pm.name for pm in record.payment_methods]
            if record.payment_methods
            else None
        )

    return record_dict


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
    from datetime import datetime
    from app.services.period_calculator import calculate_next_occurrence_from_now

    record = db.query(SimpleRecord).filter(SimpleRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record.name = data.name
    record.time = data.time
    record.period = data.period
    record.description = data.description

    db.commit()
    db.refresh(record)
    record.next_occurrence = calculate_next_occurrence_from_now(
        datetime.utcnow(), record.period, record.time
    )
    return record


@router.put("/payment/{record_id}")
def update_payment_record(
    record_id: str, data: PaymentRecordUpdate, db: Session = Depends(get_db)
):
    from datetime import datetime
    from app.services.period_calculator import calculate_next_occurrence_from_now
    from app.models.support import Category, PaymentMethod

    record = db.query(PaymentRecord).filter(PaymentRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    user_id = record.user_id or "default"

    category_objects = []
    if data.category:
        for cat_name in data.category:
            existing_category = (
                db.query(Category)
                .filter(Category.name == cat_name, Category.user_id == user_id)
                .first()
            )
            if not existing_category:
                existing_category = Category(name=cat_name, user_id=user_id)
                db.add(existing_category)
                db.flush()
            category_objects.append(existing_category)

    payment_method_objects = []
    if data.payment_method:
        for pm_name in data.payment_method:
            existing_method = (
                db.query(PaymentMethod)
                .filter(
                    PaymentMethod.name == pm_name,
                    PaymentMethod.user_id == user_id,
                )
                .first()
            )
            if not existing_method:
                existing_method = PaymentMethod(name=pm_name, user_id=user_id)
                db.add(existing_method)
                db.flush()
            payment_method_objects.append(existing_method)

    record.name = data.name
    record.description = data.description
    record.direction = data.direction
    record.amount = data.amount
    record.period = data.period
    record.start_time = data.start_time
    record.end_time = data.end_time
    record.notes = data.notes
    record.currency = data.currency

    record.categories = category_objects
    record.payment_methods = payment_method_objects

    db.commit()
    db.refresh(record)
    record.next_occurrence = calculate_next_occurrence_from_now(
        datetime.utcnow(), record.period, record.start_time
    )

    return {
        "id": record.id,
        "type": record.type,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "updated_at": record.updated_at.isoformat() if record.updated_at else None,
        "name": record.name,
        "description": record.description,
        "direction": record.direction.value if record.direction else None,
        "category": [c.name for c in record.categories],
        "amount": record.amount,
        "payment_method": [pm.name for pm in record.payment_methods],
        "period": record.period.value if record.period else None,
        "start_time": record.start_time.isoformat() if record.start_time else None,
        "end_time": record.end_time.isoformat() if record.end_time else None,
        "notes": record.notes,
        "currency": record.currency,
        "next_occurrence": record.next_occurrence.isoformat()
        if record.next_occurrence
        else None,
    }
