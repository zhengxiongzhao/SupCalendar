# SupCalandar

财务提醒日历应用 - 管理周期性的收付款记录，并与外部日历深度集成。

## 功能

- **Dashboard**: 显示收付款 TOP 10（按金额）或即将到来的简单记录（按时间）
- **日历**: 类似 iPhone 的月日历 + 记录列表
- **添加记录**: 支持简单记录、收付款记录、自定义记录
- **日历订阅**: 生成 iCal 订阅链接，供 iCloud/Gmail 日历使用
- **双向同步**: 连接 Apple/Google 账户，在 Mac 日历中对记录进行增删改查

## 技术栈

### 前端
- Vue 3 (Composition API) + TypeScript
- Vite
- shadcn-vue + Tailwind CSS
- Pinia 状态管理

### 后端
- FastAPI + Python
- SQLAlchemy ORM
- SQLite / PostgreSQL

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 复制环境变量文件
cp .env.example .env

# 启动服务
docker-compose up -d

# 前端: http://localhost:3000
# 后端 API: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

### 本地开发

**前端**:
```bash
cd frontend
npm install
npm run dev
```

**后端**:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 环境变量

参考 `.env.example` 文件配置环境变量：

- `DATABASE_TYPE`: sqlite 或 postgresql
- `DATABASE_URL`: 数据库连接字符串
- `SECRET_KEY`: JWT 密钥
- `ALLOWED_ORIGINS`: 允许的前端源

## 项目结构

```
supcalandar/
├── frontend/          # Vue 3 前端
├── backend/           # FastAPI 后端
├── docker-compose.yml
└── docs/             # 设计文档
```

## 设计文档

完整的设计文档位于 `docs/plans/2026-02-04-supcalandar-design.md`

## 许可证

MIT
