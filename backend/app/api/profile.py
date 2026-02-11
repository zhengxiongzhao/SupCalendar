from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy import select
from datetime import datetime
import json
import traceback
from ..models.record import SimpleRecord, PaymentRecord
from ..schemas.record import SimpleRecordCreate, PaymentRecordCreate
from ..database import get_db

router = APIRouter(prefix="/profile", tags=["个人中心"])


@router.get("/export")
async def export_records():
    """
    导出所有记录为 JSON 格式
    """
    try:
        db = next(get_db())

        # 获取所有简单提醒
        simple_records = (
            db.execute(select(SimpleRecord).order_by(SimpleRecord.time.desc()))
            .scalars()
            .all()
        )

        # 获取所有收付款记录
        payment_records = (
            db.execute(select(PaymentRecord).order_by(PaymentRecord.start_time.desc()))
            .scalars()
            .all()
        )

        # 转换为可序列化的字典格式
        export_data = {
            "version": "1.0.0",
            "export_date": datetime.utcnow().isoformat() + "Z",
            "records": [],
        }

        # 添加简单提醒
        for record in simple_records:
            export_data["records"].append(
                {
                    "type": "simple",
                    "id": record.id,
                    "title": record.name,
                    "date": record.time.isoformat() if record.time else None,
                    "category": record.description or "",
                    "repeat_type": record.period.value if record.period else "none",
                    "days_before": 0,
                    "created_at": record.created_at.isoformat()
                    if record.created_at
                    else None,
                    "updated_at": record.updated_at.isoformat()
                    if record.updated_at
                    else None,
                }
            )

        # 添加收付款记录
        for record in payment_records:
            export_data["records"].append(
                {
                    "type": "payment",
                    "id": record.id,
                    "title": record.name,
                    "amount": float(record.amount) if record.amount else 0,
                    "currency": record.currency or "CNY",
                    "date": record.start_time.isoformat()
                    if record.start_time
                    else None,
                    "category": record.description or "",
                    "payment_type": record.direction.value
                    if record.direction
                    else "incoming",
                    "repeat_type": record.period.value if record.period else "none",
                    "created_at": record.created_at.isoformat()
                    if record.created_at
                    else None,
                    "updated_at": record.updated_at.isoformat()
                    if record.updated_at
                    else None,
                }
            )

        db.close()

        return JSONResponse(content=export_data)

    except Exception as e:
        print(f"导出记录失败: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500, content={"error": f"导出记录失败: {str(e)}"}
        )


@router.post("/import")
async def import_records(file: UploadFile = File(...)):
    """
    从 JSON 文件导入记录
    """
    try:
        # 读取文件内容
        content = await file.read()
        data = json.loads(content.decode("utf-8"))

        # 验证格式
        if "records" not in data:
            return JSONResponse(
                status_code=400, content={"error": "无效的文件格式：缺少 records 字段"}
            )

        records = data["records"]
        db = next(get_db())

        # 统计结果
        result = {
            "success": True,
            "total": len(records),
            "imported": 0,
            "simple_records": 0,
            "payment_records": 0,
            "errors": [],
        }

        # 导入每条记录
        for idx, record in enumerate(records):
            try:
                record_type = record.get("type")

                if record_type == "simple":
                    # 创建简单提醒
                    simple_record = SimpleRecord(
                        title=record.get("title", ""),
                        time=datetime.fromisoformat(record["date"])
                        if record.get("date")
                        else datetime.utcnow(),
                        category=record.get("category", ""),
                        repeat_type=record.get("repeat_type", "none"),
                        days_before=record.get("days_before", 0),
                    )
                    db.add(simple_record)
                    db.flush()
                    result["imported"] += 1
                    result["simple_records"] += 1

                elif record_type == "payment":
                    # 创建收付款记录
                    payment_record = PaymentRecord(
                        title=record.get("title", ""),
                        amount=record.get("amount", 0),
                        currency=record.get("currency", "CNY"),
                        start_time=datetime.fromisoformat(record["date"])
                        if record.get("date")
                        else datetime.utcnow(),
                        category=record.get("category", ""),
                        direction=record.get("payment_type", "incoming"),
                        repeat_type=record.get("repeat_type", "none"),
                    )
                    db.add(payment_record)
                    db.flush()
                    result["imported"] += 1
                    result["payment_records"] += 1

                else:
                    result["errors"].append(
                        {"index": idx, "reason": f"未知记录类型: {record_type}"}
                    )

            except Exception as e:
                result["errors"].append({"index": idx, "reason": f"导入失败: {str(e)}"})

        # 提交所有更改
        db.commit()
        db.close()

        return JSONResponse(content=result)

    except json.JSONDecodeError as e:
        return JSONResponse(
            status_code=400, content={"error": f"无效的 JSON 格式: {str(e)}"}
        )
    except Exception as e:
        print(f"导入记录失败: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500, content={"error": f"导入记录失败: {str(e)}"}
        )


@router.get("/stats")
async def get_profile_stats():
    """
    获取个人统计数据
    """
    try:
        db = next(get_db())

        # 统计简单提醒数
        simple_records = db.execute(select(SimpleRecord)).scalars().all()
        simple_count = len(simple_records)

        # 统计收付款记录和金额
        payment_records = db.execute(select(PaymentRecord)).scalars().all()

        payment_count = len(payment_records)
        total_income = 0.0
        total_expense = 0.0

        for record in payment_records:
            if record.direction == "income":
                total_income += float(record.amount or 0)
            elif record.direction == "expense":
                total_expense += float(record.amount or 0)

        # 统计本月记录数
        from datetime import datetime

        current_month = datetime.utcnow().strftime("%Y-%m")

        this_month_count = 0
        for record in payment_records:
            if record.start_time:
                record_month = record.start_time.strftime("%Y-%m")
                if record_month == current_month:
                    this_month_count += 1

        simple_records_month = (
            db.execute(
                select(SimpleRecord).where(SimpleRecord.time.like(f"{current_month}%"))
            )
            .scalars()
            .all()
        )
        this_month_count += len(simple_records_month)

        db.close()

        # 直接返回 stats 对象，与前端期望的格式一致
        return {
            "total_records": simple_count + payment_count,
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "this_month_records": this_month_count,
        }

    except Exception as e:
        print(f"获取统计数据失败: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500, content={"error": f"获取统计数据失败: {str(e)}"}
        )
