# SupCalandar 设计文档

**日期**: 2026-02-04
**版本**: 1.0

## 项目概述

SupCalandar 是一个财务提醒日历应用，用于管理周期性的收付款记录，并与外部日历（iCloud、Google Calendar）深度集成。

### 核心功能

- **Dashboard**: 显示收付款 TOP 10（按金额）或即将到来的简单记录（按时间）
- **日历**: 类似 iPhone 的月日历 + 记录列表
- **添加记录**: 支持简单记录、收付款记录、自定义记录
- **日历订阅**: 生成 iCal 订阅链接，供 iCloud/Gmail 日历使用
- **双向同步**: 连接 Apple/Google 账户，在 Mac 日历中对记录进行增删改查

## 技术栈

### 前端
- **Vue 3** (Composition API) + TypeScript
- **Vite** 构建工具
- **shadcn-vue** + Tailwind CSS UI 组件库
- **Vue Router** 路由管理
- **Pinia** 状态管理
- **VueUse** 实用工具集

### 后端
- **FastAPI** + Python
- **SQLAlchemy** ORM
- **Pydantic** 数据验证
- **Alembic** 数据库迁移
- **APScheduler** 定时任务
- **python-socketio** WebSocket

### 数据库（混合支持）
- **SQLite** - 本地模式
- **PostgreSQL** - 云端模式

### 部署
- **Docker Compose** - 一键启动

### 日历集成
- **ICal.js** - 解析/生成 iCalendar 格式
- **CalDAV** - 与 iCloud/Google 日历双向同步

## 系统架构

```
┌────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│           Vue Components + shadcn-vue UI                │
└────────────────────┬───────────────────────────────────┘
                     │ HTTP / WebSocket
┌────────────────────▼───────────────────────────────────┐
│                   Business Layer                        │
│              FastAPI + Pydantic                         │
│  - RESTful API                                          │
│  - WebSocket (实时提醒)                                  │
│  - Periodic Job Scheduling (APScheduler)                 │
└────────────────────┬───────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │                         │
┌───────▼───────┐        ┌───────▼────────┐
│  Data Access  │        │  Data Access   │
│   SQLite      │        │  PostgreSQL    │
│   (本地模式)   │        │  (云端模式)     │
└───────────────┘        └────────────────┘
        │                         │
        └──────────┬──────────────┘
                   │
        ┌──────────▼────────────────┐
        │   External Integration    │
        │  CalDAV (iCloud/Google)  │
        └───────────────────────────┘
```

## 数据模型

### 核心数据结构

```python
from enum import Enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class RecordType(str, Enum):
    SIMPLE = "simple"
    PAYMENT = "payment"
    CUSTOM = "custom"

class PeriodType(str, Enum):
    NATURAL_MONTH = "natural-month"
    MEMBERSHIP_MONTH = "membership-month"
    QUARTER = "quarter"
    YEAR = "year"

class Direction(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class BaseRecord(Base):
    __tablename__ = "records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(SQLEnum(RecordType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "base"
    }

class SimpleRecord(BaseRecord):
    __tablename__ = "simple_records"

    record_id = Column(String, ForeignKey("records.id"), primary_key=True)
    name = Column(String, nullable=False)
    time = Column(DateTime, nullable=False)
    period = Column(SQLEnum(PeriodType), nullable=False)
    description = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": RecordType.SIMPLE
    }

class PaymentRecord(BaseRecord):
    __tablename__ = "payment_records"

    record_id = Column(String, ForeignKey("records.id"), primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    direction = Column(SQLEnum(Direction), nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    period = Column(SQLEnum(PeriodType), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    notes = Column(String)

    __mapper_args__ = {
        "polymorphic_identity": RecordType.PAYMENT
    }

class CustomRecord(BaseRecord):
    __tablename__ = "custom_records"

    record_id = Column(String, ForeignKey("records.id"), primary_key=True)
    template_id = Column(String, ForeignKey("custom_field_templates.id"))
    custom_fields = Column(JSON, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": RecordType.CUSTOM
    }

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(SQLEnum(Direction), nullable=False)
    color = Column(String)

class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)

class CalendarProvider(str, Enum):
    ICLOUD = "icloud"
    GOOGLE = "google"

class CalendarSync(Base):
    __tablename__ = "calendar_syncs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider = Column(SQLEnum(CalendarProvider), nullable=False)
    account_id = Column(String, nullable=False)
    enabled = Column(Boolean, default=False)
    last_sync_at = Column(DateTime)
    auth_data = Column(String)  # 加密存储

class CustomFieldTemplate(Base):
    __tablename__ = "custom_field_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    fields = Column(JSON, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True)
    cloud_sync_enabled = Column(Boolean, default=False)
```

### 周期计算逻辑

```python
from datetime import datetime
from dateutil.relativedelta import relativedelta

def calculate_next_occurrence(
    base_date: datetime,
    period: PeriodType,
    start_date: datetime
) -> datetime:
    """计算下一次发生时间"""
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
```

## API 设计

### RESTful API 端点

**记录管理**
```
POST   /api/v1/records/simple           创建简单记录
POST   /api/v1/records/payment          创建收付款记录
POST   /api/v1/records/custom            创建自定义记录
GET    /api/v1/records                  获取所有记录
GET    /api/v1/records/{id}             获取单条记录
PUT    /api/v1/records/{id}             更新记录
DELETE /api/v1/records/{id}             删除记录
GET    /api/v1/records/upcoming         获取即将到来的记录（日历用）
```

**Dashboard 数据**
```
GET    /api/v1/dashboard/top-payments    收付款 TOP 10（按金额）
GET    /api/v1/dashboard/upcoming-simples 即将到来的简单记录 TOP 10（按时间）
GET    /api/v1/dashboard/summary        总览统计（本月收支）
```

**分类和付款方式**
```
GET    /api/v1/categories               获取所有分类
POST   /api/v1/categories               创建分类
GET    /api/v1/payment-methods           获取所有付款方式
POST   /api/v1/payment-methods           创建付款方式
```

**日历集成**
```
GET    /api/v1/calendar/subscriptions    获取订阅链接（iCal）
GET    /api/v1/calendar/feed/{token}    获取 iCalendar 内容
POST   /api/v1/calendar/subscriptions/regenerate 重新生成订阅 token
GET    /api/v1/calendar/connect/google   获取 Google OAuth URL
POST   /api/v1/calendar/connect/icloud  连接 iCloud CalDAV
POST   /api/v1/calendar/callback/google Google OAuth 回调
POST   /api/v1/calendar/sync-accounts   获取所有同步账户
PUT    /api/v1/calendar/sync-accounts/{id} 更新同步账户状态
DELETE /api/v1/calendar/sync-accounts/{id} 断开连接
POST   /api/v1/calendar/sync-accounts/{id}/sync 手动触发同步
```

**自定义记录**
```
GET    /api/v1/templates                获取所有模板
POST   /api/v1/templates                创建自定义模板
GET    /api/v1/templates/{id}           获取模板详情
PUT    /api/v1/templates/{id}           更新模板
DELETE /api/v1/templates/{id}           删除模板
```

### WebSocket 事件

```
ws://api/v1/ws/realtime

客户端 ← 服务端
record.created     新记录创建
record.updated     记录更新
record.deleted     记录删除
sync.completed     日历同步完成
```

## 前端组件

### 目录结构

```
src/
├── components/          # 可复用组件
│   ├── dashboard/       # Dashboard 组件
│   │   ├── TopPayments.vue
│   │   └── UpcomingSimples.vue
│   ├── calendar/        # 日历组件
│   │   ├── MonthCalendar.vue
│   │   ├── RecordList.vue
│   │   ├── CalendarGrid.vue
│   │   ├── SubscriptionLinks.vue
│   │   └── CalDAVManager.vue
│   ├── forms/           # 表单组件
│   │   ├── SimpleRecordForm.vue
│   │   ├── PaymentRecordForm.vue
│   │   ├── CustomRecordForm.vue
│   │   └── TemplateBuilder.vue
│   └── ui/              # shadcn-vue 组件引用
├── stores/              # Pinia stores
│   ├── records.ts
│   ├── dashboard.ts
│   ├── calendar.ts
│   └── templates.ts
├── composables/         # Composables
│   ├── useRecords.ts
│   ├── useCalendar.ts
│   └── useWebSocket.ts
├── services/            # API 服务
│   ├── api.ts
│   └── websocket.ts
├── types/               # TypeScript 类型
│   └── index.ts
└── utils/               # 工具函数
    ├── date.ts
    └── period.ts
```

### 核心页面

1. **Dashboard** (`/`) - 根据 hasPayments 显示不同内容
2. **日历** (`/calendar`) - 月日历 + 记录列表
3. **添加记录** (`/add`) - 记录类型选择 + 表单

## 日历集成

### iCal 订阅

- 生成标准 iCalendar (.ics) 格式
- 支持 iCloud、Google Calendar、Outlook 订阅
- 订阅 token 定期刷新（安全性）

### CalDAV 双向同步

- 支持 iCloud 和 Google Calendar
- 基于 UID 的记录映射
- 时间戳冲突检测
- 增量同步（只同步变更部分）

### OAuth 集成

- Google Calendar OAuth 2.0
- iCloud 应用专用密码
- Token 自动刷新

## 部署配置

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
      - VITE_WS_URL=ws://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_TYPE=postgresql
      - DATABASE_URL=postgresql://user:pass@db:5432/supcal
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=supcal
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pg_data:/var/lib/postgresql/data
    profiles:
      - cloud

volumes:
  pg_data:
```

### 环境变量

```bash
DATABASE_TYPE=postgresql  # sqlite 或 postgresql
DATABASE_URL=postgresql://user:pass@db:5432/supcal
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 测试策略

### 后端测试

- pytest 单元测试
- API 集成测试
- 数据模型测试
- CalDAV 同步测试（mock）

### 前端测试

- Vitest 单元测试
- Pinia store 测试
- 组件快照测试
- E2E 测试（Playwright）

## 实施计划

### Phase 1: 项目初始化 (1-2天)
- 初始化前端项目
- 初始化后端项目
- 配置 Docker Compose
- 设置数据库和迁移

### Phase 2: 核心数据模型 (2-3天)
- 实现 Record 数据模型
- 实现 Category, PaymentMethod 模型
- 创建数据库迁移
- 实现 CRUD API 端点

### Phase 3: Dashboard (3-4天)
- 实现周期计算服务
- 实现 Dashboard API
- 创建 Dashboard 组件
- 实现状态管理

### Phase 4: 日历功能 (4-5天)
- 实现月日历组件
- 实现记录列表组件
- 创建日历 API

### Phase 5: 添加记录表单 (2-3天)
- 实现简单记录表单
- 实现收付款表单
- 实现自定义记录功能

### Phase 6: 日历集成 (3-4天)
- 实现 iCal 订阅链接
- 实现 OAuth 服务
- 实现 CalDAV 双向同步

### Phase 7: WebSocket 实时更新 (1-2天)
- 实现 WebSocket 服务
- 集成前端 WebSocket 客户端

### Phase 8: 测试与优化 (2-3天)
- 编写单元测试
- 集成测试
- 性能优化

### Phase 9: 部署与文档 (1-2天)
- 完善 Docker 配置
- 编写文档
- 生产部署准备

**总计：约 18-25 个工作日**
