from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.record import BaseRecord, SimpleRecord, PaymentRecord
from app.models.base import Direction
from app.services.period_calculator import calculate_next_occurrence_from_now

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/top-payments")
def get_top_payments(limit: int = 10, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    payment_records = (
        db.query(PaymentRecord).order_by(PaymentRecord.amount.desc()).limit(limit).all()
    )

    for record in payment_records:
        # 使用新的 calculate_next_occurrence_from_now 函数
        record.next_occurrence = calculate_next_occurrence_from_now(
            now, record.period, record.start_time
        )

    return payment_records


@router.get("/upcoming-simples")
def get_upcoming_simples(limit: int = 10, db: Session = Depends(get_db)):
    now = datetime.utcnow()

    # 获取所有记录（简单提醒 + 收付款）
    simple_records = db.query(SimpleRecord).all()
    payment_records = db.query(PaymentRecord).all()

    # 合并所有记录并计算下一次发生时间
    records_with_next = []

    # 处理简单提醒
    for record in simple_records:
        next_occurrence = calculate_next_occurrence_from_now(
            now, record.period, record.time
        )
        if next_occurrence:
            record.next_occurrence = next_occurrence
            records_with_next.append(record)

    # 处理收付款记录
    for record in payment_records:
        # 使用新的 calculate_next_occurrence_from_now 函数
        next_occurrence = calculate_next_occurrence_from_now(
            now, record.period, record.start_time
        )
        if next_occurrence:
            record.next_occurrence = next_occurrence
            records_with_next.append(record)

    # 按下次发生时间升序排序，取前 limit 条
    records_with_next.sort(key=lambda x: x.next_occurrence)

    return records_with_next[:limit]


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


def calculate_next_occurrence_v2(
    now: datetime, period: str, start_time: datetime
) -> datetime:
    """计算下一次发生时间，正确处理周期性事件"""
    from app.models.base import PeriodType
    from app.services.period_calculator import calculate_next_occurrence as calc

    period_type = PeriodType(period)
    return calc(now, period_type, start_time)
