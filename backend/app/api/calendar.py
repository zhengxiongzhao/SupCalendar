from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.record import BaseRecord, SimpleRecord, PaymentRecord
from app.models.base import Direction
from app.services.ical_service import ICalService

router = APIRouter(prefix="/calendar", tags=["calendar"])


def get_record_date(record: BaseRecord) -> datetime:
    if isinstance(record, SimpleRecord):
        return datetime.fromisoformat(record.time)
    elif isinstance(record, PaymentRecord):
        return datetime.fromisoformat(record.start_time)
    else:
        return datetime.fromisoformat(record.created_at)


@router.get("/records")
def get_calendar_records(
    start_date: datetime, end_date: datetime, db: Session = Depends(get_db)
):
    records = (
        db.query(BaseRecord)
        .filter(BaseRecord.created_at >= start_date, BaseRecord.created_at <= end_date)
        .all()
    )

    result = []
    for record in records:
        event = {"id": record.id, "date": get_record_date(record), "record": record}
        result.append(event)

    return result


@router.get("/month/{year}/{month}")
def get_month_records(year: int, month: int, db: Session = Depends(get_db)):
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)

    records = (
        db.query(BaseRecord)
        .filter(BaseRecord.created_at >= start_date, BaseRecord.created_at <= end_date)
        .all()
    )

    result = []
    for record in records:
        event = {"id": record.id, "date": get_record_date(record), "record": record}
        result.append(event)

    return result


@router.get("/subscriptions/token")
def get_subscription_token():
    token = "demo-token-123"
    host = "localhost:8000"
    return {
        "webcal_url": f"webcal://{host}/api/v1/calendar/feed/{token}",
        "http_url": f"http://{host}/api/v1/calendar/feed/{token}",
        "google_url": f"https://www.google.com/calendar/render?cid=http://{host}/api/v1/calendar/feed/{token}",
    }


@router.get("/feed/{token}")
def get_ical_feed(token: str, db: Session = Depends(get_db)):
    records = db.query(BaseRecord).all()
    ical_content = ICalService.generate_subscription_ical(records)

    return Response(
        content=ical_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": 'attachment; filename="supcal.ics"',
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    )
