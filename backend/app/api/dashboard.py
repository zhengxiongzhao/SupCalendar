from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.record import BaseRecord, SimpleRecord, PaymentRecord
from app.models.base import Direction

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/top-payments")
def get_top_payments(limit: int = 10, db: Session = Depends(get_db)):
    payment_records = (
        db.query(PaymentRecord).order_by(PaymentRecord.amount.desc()).limit(limit).all()
    )

    for record in payment_records:
        record.next_occurrence = calculate_next_occurrence(
            datetime.utcnow(), record.period, record.start_time
        )

    return payment_records


@router.get("/upcoming-simples")
def get_upcoming_simples(limit: int = 10, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    simple_records = (
        db.query(SimpleRecord)
        .filter(SimpleRecord.time >= now)
        .order_by(SimpleRecord.time.asc())
        .limit(limit)
        .all()
    )

    return simple_records


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    payment_records = (
        db.query(PaymentRecord).filter(PaymentRecord.start_time >= month_start).all()
    )

    income = sum(r.amount for r in payment_records if r.direction == Direction.INCOME)
    expense = sum(r.amount for r in payment_records if r.direction == Direction.EXPENSE)
    balance = income - expense

    return {"income": income, "expense": expense, "balance": balance}


def calculate_next_occurrence(
    base_date: datetime, period: str, start_date: datetime
) -> datetime:
    from app.services.period_calculator import calculate_next_occurrence as calc
    from app.models.base import PeriodType

    period_type = PeriodType(period)
    return calc(base_date, period_type, start_date)
