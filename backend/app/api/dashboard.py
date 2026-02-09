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

    # 获取所有记录（简单提醒 + 收付款）
    simple_records = db.query(SimpleRecord).all()
    payment_records = db.query(PaymentRecord).all()

    # 合并所有记录并计算下一次发生时间
    records_with_next = []

    # 处理简单提醒
    for record in simple_records:
        next_occurrence = calculate_next_occurrence_v2(now, record.period, record.time)
        if next_occurrence:
            record.next_occurrence = next_occurrence
            records_with_next.append(record)

    # 处理收付款记录
    for record in payment_records:
        # 使用现有的 calculate_next_occurrence 函数
        next_occurrence = calculate_next_occurrence(
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
) -> datetime | None:
    """计算下一次发生时间，正确处理周期性事件"""
    from app.models.base import PeriodType
    from dateutil.relativedelta import relativedelta

    period_type = PeriodType(period)

    # 如果 start_time 在未来，直接返回
    if start_time >= now:
        return start_time

    # 计算从 start_time 到 now 经过了多少个周期
    delta = now - start_time

    if period_type == PeriodType.NATURAL_MONTH:
        # 自然月：每月的固定日期
        current = start_time
        while current < now:
            # 找到下一个月的同一天
            if current.month == 12:
                current = datetime(current.year + 1, 1, start_time.day)
            else:
                try:
                    current = datetime(current.year, current.month + 1, start_time.day)
                except ValueError:
                    # 处理 2 月没有 30/31 号的情况，取月末
                    if current.month + 1 == 3:
                        current = datetime(current.year, 3, 1)
        return current

    elif period_type == PeriodType.MEMBERSHIP_MONTH:
        # 会员月：每30天
        current = start_time
        while current < now:
            current = current + relativedelta(months=1)
        return current

    elif period_type == PeriodType.QUARTER:
        # 季度：每3个月
        current = start_time
        while current < now:
            current = current + relativedelta(months=3)
        return current

    elif period_type == PeriodType.YEAR:
        # 年度：每年
        current = start_time
        while current < now:
            current = datetime(current.year + 1, start_time.month, start_time.day)
        return current

    return None
