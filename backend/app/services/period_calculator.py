from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.models.base import PeriodType


def calculate_next_occurrence(
    base_date: datetime, period: PeriodType, start_date: datetime
) -> datetime:
    if period == PeriodType.WEEK:
        return base_date + relativedelta(weeks=1)

    elif period == PeriodType.MONTH:
        return base_date + relativedelta(months=1)

    elif period == PeriodType.QUARTER:
        return base_date + relativedelta(months=3)

    elif period == PeriodType.HALF_YEAR:
        return base_date + relativedelta(months=6)

    elif period == PeriodType.YEAR:
        return base_date + relativedelta(years=1)


def calculate_next_occurrences(
    start_date: datetime, period: PeriodType, count: int = 10
) -> list[datetime]:
    occurrences = []
    current = start_date

    for _ in range(count):
        current = calculate_next_occurrence(current, period, start_date)
        occurrences.append(current)

    return occurrences


def calculate_next_occurrence_from_now(
    now: datetime, period: PeriodType, start_date: datetime
) -> datetime:
    """
    计算从当前时间开始的下一个周期时间

    如果 start_date >= now，直接返回 start_date
    否则，从 start_date 开始，按照周期递增，找到第一个 >= now 的日期

    例如：
    - start_date: 2024-11-01
    - period: QUARTER
    - now: 2026-02-11
    - 返回: 2026-05-01
    """
    if start_date >= now:
        return start_date

    # 从 start_date 开始，按周期递增，找到第一个 >= now 的日期
    current = start_date
    while current < now:
        current = calculate_next_occurrence(current, period, start_date)

    return current
