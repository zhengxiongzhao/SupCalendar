from icalendar import Calendar, Event
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.record import BaseRecord, SimpleRecord, PaymentRecord
from app.models.base import Direction
import pytz


class ICalService:
    @staticmethod
    def generate_subscription_ical(records: list[BaseRecord]) -> str:
        cal = Calendar()
        cal.add("prodid", "-//SupCal//Calendar//CN")
        cal.add("version", "2.0")
        cal.add("X-WR-CALNAME", "财务提醒日历")
        cal.add("X-WR-TIMEZONE", "Asia/Shanghai")
        cal.add("X-WR-CALDESC", "收付款记录与提醒")

        tz = pytz.timezone("Asia/Shanghai")

        for record in records:
            event = Event()
            event.add("uid", record.id)
            event.add("summary", ICalService._format_summary(record))

            if isinstance(record, SimpleRecord):
                dt = record.time
                if dt.tzinfo is None:
                    dt = tz.localize(dt)
                event.add("dtstart", dt)
                event.add("dtend", dt)
            elif isinstance(record, PaymentRecord):
                dt = record.start_time
                if dt.tzinfo is None:
                    dt = tz.localize(dt)
                event.add("dtstart", dt)
                end_dt = record.end_time or record.start_time
                if end_dt.tzinfo is None:
                    end_dt = tz.localize(end_dt)
                event.add("dtend", end_dt)

            event.add("description", ICalService._format_description(record))
            cal.add_component(event)

        return cal.to_ical().decode("utf-8")

    @staticmethod
    def _format_summary(record: BaseRecord) -> str:
        if isinstance(record, PaymentRecord):
            icon = "↗️" if record.direction == Direction.INCOME else "↘️"
            return f"{icon} {record.name} ¥{record.amount}"
        elif isinstance(record, SimpleRecord):
            return f"📌 {record.name}"
        return record.name

    @staticmethod
    def _format_description(record: BaseRecord) -> str:
        desc_parts = []
        if isinstance(record, PaymentRecord):
            desc_parts.append(
                f"方向: {'收入' if record.direction == Direction.INCOME else '支出'}"
            )
            desc_parts.append(f"分类: {record.category}")
            desc_parts.append(f"付款方式: {record.payment_method}")
            if record.notes:
                desc_parts.append(f"备注: {record.notes}")
        elif isinstance(record, SimpleRecord):
            desc_parts.append(f"类型: 简单记录")
            if record.description:
                desc_parts.append(f"描述: {record.description}")

        return "\n".join(desc_parts)
