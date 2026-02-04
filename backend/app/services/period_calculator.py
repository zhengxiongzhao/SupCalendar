from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.models.base import PeriodType


def calculate_next_occurrence(
    base_date: datetime, period: PeriodType, start_date: datetime
) -> datetime:
    if period == PeriodType.NATURAL_MONTH:
        day = start_date.day
        month = base_date.month + 1 if base_date.day >= day else base_date.month
        year = base_date.year if base_date.month < month else base_date.year + 1
        return datetime(year, month, day)

    elif period == PeriodType.MEMBERSHIP_MONTH:
        return start_date + relativedelta(months=1)

    elif period == PeriodType.QUARTER:
        return start_date + relativedelta(months=3)

    elif period == PeriodType.YEAR:
        return start_date + relativedelta(years=1)


def calculate_next_occurrences(
    start_date: datetime, period: PeriodType, count: int = 10
) -> list[datetime]:
    occurrences = []
    current = start_date

    for _ in range(count):
        current = calculate_next_occurrence(current, period, start_date)
        occurrences.append(current)

    return occurrences
