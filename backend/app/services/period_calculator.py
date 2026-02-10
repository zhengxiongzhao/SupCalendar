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
        return start_date + relativedelta(months=3)

    elif period == PeriodType.HALF_YEAR:
        return start_date + relativedelta(months=6)

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
