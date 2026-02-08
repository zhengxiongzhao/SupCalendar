# SupCalandar

财务提醒日历应用 - 管理周期性的收付款记录，并与外部日历深度集成。

## 功能

### 核心功能
- **Dashboard**: 显示收付款 TOP 10（按金额）或即将到来的简单记录（按时间），支持查看本月收入/支出/结余统计
- **日历视图**: 月历展示 + 点击日期查看当天记录，支持月份切换和快速定位今天
- **所有记录**: 列表展示所有记录，支持按类型筛选（全部/收付款/提醒）

### 记录管理
- **添加记录**: 
  - 收付款记录：名称、类型（收入/支出）、金额、分类、付款方式、时间范围、重复周期、备注
  - 简单提醒：名称、提醒时间、重复周期、备注
  - 分类和付款方式支持输入或从现有选项选择
  - 结束时间根据重复周期自动计算（可手动修改）
- **编辑记录**: 支持修改所有字段，自动加载现有数据
- **删除记录**: 点击删除按钮，确认后删除

### 记录类型
- **收付款记录**: 周期性收入/支出，支持自然月、会员月、季度、年度周期
- **简单提醒**: 周期性提醒事项，支持相同的周期选项

### 日历集成
- **日历订阅**: 生成 iCal 订阅链接，供 iCloud/Gmail 日历使用
- **双向同步**: 连接 Apple/Google 账户，在 Mac 日历中对记录进行增删改查

## 技术栈

### 前端
- Vue 3 (Composition API) + TypeScript
- Vue Router 4（单页应用路由）
- Vite（构建工具）
- Tailwind CSS v4（样式框架）
- Pinia（状态管理）

### 后端
- FastAPI + Python
- SQLAlchemy ORM
- SQLite / PostgreSQL

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 启动服务
docker-compose up -d --build

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
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   ├── common/        # 通用组件（ComboInput 等）
│   │   │   ├── dashboard/     # Dashboard 组件
│   │   │   ├── calendar/      # 日历组件
│   │   │   ├── forms/         # 表单组件
│   │   │   └── layout/        # 布局组件
│   │   ├── views/         # 页面视图
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── services/      # API 服务
│   │   └── types/         # TypeScript 类型定义
│   └── ...
├── backend/           # FastAPI 后端
├── docker-compose.yml
└── docs/             # 设计文档
```

## 响应式设计

- **PC端**: 左侧固定导航栏，鼠标悬停显示编辑/删除按钮
- **移动端**: 底部固定标签栏，编辑/删除按钮始终可见，触摸友好的大点击区域

## 路由

| 路径 | 功能 |
|------|------|
| `/` | Dashboard 概览 |
| `/calendar` | 日历视图 |
| `/records` | 所有记录列表 |
| `/create` | 新建记录 |
| `/edit/:id` | 编辑记录 |

## 开发状态

| 功能模块 | 状态 |
|---------|------|
| 项目初始化 | ✅ |
| 数据模型与 CRUD | ✅ |
| Dashboard | ✅ |
| 日历功能 | ✅ |
| 添加记录表单 | ✅ |
| 编辑/删除记录 | ✅ |
| 响应式布局 | ✅ |
| iCal 订阅 | ✅ |
| CalDAV 双向同步 | ⏳（基础架构已实现） |
| WebSocket 实时更新 | ⏳（基础架构已实现） |

## 许可证

MIT
