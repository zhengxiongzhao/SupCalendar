# 功能需求记录

本文档记录项目开发过程中的功能需求和改进。

## 2026-02-09 交互优化

### 1. 记录列表页优化

**需求**: 记录列表页的每条记录应该可以点击跳转到编辑页面

**实现状态**: ✅ 已完成

**修改文件**:
- `frontend/src/views/RecordsList.vue`

**实现内容**:
- 记录行添加点击事件 `@click="navigateToEdit(record.id)"`
- 添加 `cursor-pointer` 样式提示可点击
- 编辑和删除按钮添加 `@click.stop` 防止事件冒泡

**功能**: 点击任意记录项即可跳转到编辑页 `/edit/{id}`

---

### 2. Dashboard - 收付款 TOP 10 优化

**需求**: 收付款 TOP 10 列表应该支持交互

**实现状态**: ✅ 已完成

**修改文件**:
- `frontend/src/components/dashboard/PaymentList.vue`

**实现内容**:
- 记录行添加点击事件 `@click="navigateToEdit(record.id)"`
- 添加 `cursor-pointer` 样式
- 添加 `navigateToEdit` 函数
- "查看全部"按钮改为导航到记录列表（带 payment 筛选）
- 空状态时"添加第一条"改为"查看全部"

**功能**:
- 点击记录跳转到编辑页
- "查看全部"跳转到 `/records?filter=payment`

---

### 3. Dashboard - 即将到来优化（原：只显示简单提醒）

**需求**: 即将到来列表应该支持更丰富的功能

**实现状态**: ✅ 已完成

**修改文件**:
- `frontend/src/components/dashboard/UpcomingList.vue`
- `frontend/src/types/index.ts`
- `frontend/src/stores/dashboard.ts`
- `frontend/src/views/CalendarView.vue`
- `frontend/src/views/RecordsList.vue`
- `frontend/src/components/calendar/DayRecords.vue`
- `frontend/src/components/calendar/RecordList.vue`
- `backend/app/api/dashboard.py`

**实现内容**:

**后端修改** (`dashboard.py`):
- `/api/v1/dashboard/upcoming-simples` 端点修改：
  - 同时获取简单提醒（SimpleRecord）和收付款（PaymentRecord）
  - 为所有记录计算下一次发生时间
  - 按下次发生时间升序排序
  - 返回 Top 10

**前端修改**:

1. **类型系统重构** (`types/index.ts`):
   - 新增 `CalendarRecord` 类型 = `SimpleRecord | PaymentRecord`
   - 保留原有 `Record` 类型用于兼容

2. **组件通用化** (`UpcomingList.vue`):
   - 使用 `CalendarRecord` 类型支持两种记录
   - `getRecordIcon()`: 收付款显示 ↗/↘，简单提醒显示 📅
   - `getRecordColor()`: 收付款显示绿色/红色，简单提醒显示蓝色
   - `getRecordSubtitle()`: 收付款显示分类，简单提醒显示周期
   - `getDisplayTime()`: 优先显示 `next_occurrence`
   - "查看全部"按钮导航到 `/records`
   - 空状态"添加提醒"跳转到创建页

3. **Store 更新** (`dashboard.ts`):
   - `upcomingSimples` 类型改为 `CalendarRecord[]`

4. **CalendarView 兼容**:
   - 使用 `{ date: Date }` 格式的对象用于日历组件
   - 过滤逻辑支持 `CalendarRecord` 类型

5. **RecordsList 兼容**:
   - 筛选逻辑支持 `CalendarRecord` 类型

6. **日历组件兼容**:
   - `DayRecords.vue` 使用 `CalendarRecord` 类型
   - `RecordList.vue` 使用 `CalendarRecord` 类型

**功能**:
- 同时显示简单提醒和收付款记录
- 按下次发生时间统一排序
- 不同记录类型有不同的图标和颜色
- 点击记录跳转到编辑页
- 空状态引导用户添加提醒

---

## 技术债务

### 类型系统不统一
- `Record` 和 `CalendarRecord` 两种类型存在
- 建议: 统一为 `CalendarRecord`，逐步替换所有 `Record` 引用

---

## 2026-02-10 金额可以为 0 + 货币类型支持

### 1. 金额可以为 0

**需求描述：**
- 收付款记录的金额允许设置为 0
- 当前验证逻辑阻止了金额为 0（`amount <= 0`）
- 需要修改验证条件为 `amount < 0`

**实现状态：** ✅ 已完成

**修改文件：**
- `frontend/src/components/forms/PaymentRecordForm.vue`
- `frontend/src/views/EditRecord.vue`

**修改内容：**
```typescript
// 修改前
if (form.amount <= 0) {
  error.value = '请输入有效金额'
  return
}

// 修改后
if (form.amount < 0) {
  error.value = '请输入有效金额'
  return
}
```

---

### 2. 支持货币类型（CNY / USD）

**需求描述：**
- 允许用户选择货币类型：CNY（人民币）或 USD（美元）
- 货币符号动态显示（¥ 或 $）
- 每个记录可以独立设置货币类型

**实现状态：** ✅ 已完成

**修改文件：**

**后端：**
- `backend/app/models/record.py` - PaymentRecord 模型添加 `currency` 字段
- `backend/app/schemas/record.py` - PaymentRecordCreate/Update/Response 添加 `currency` 字段
- `backend/app/api/records.py` - 创建和更新函数处理 `currency` 字段

**前端：**
- `frontend/src/types/index.ts` - 添加 Currency 类型、CURRENCY_SYMBOLS、CURRENCY_OPTIONS
- `frontend/src/components/forms/PaymentRecordForm.vue` - 添加货币选择器
- `frontend/src/views/EditRecord.vue` - 添加货币选择器和加载逻辑
- `frontend/src/components/dashboard/TopPayments.vue` - 支持动态货币符号
- `frontend/src/components/dashboard/PaymentList.vue` - 支持动态货币符号
- `frontend/src/views/RecordsList.vue` - 支持动态货币符号
- `frontend/src/components/calendar/DayRecords.vue` - 支持动态货币符号
- `frontend/src/components/calendar/RecordList.vue` - 支持动态货币符号

**实现内容：**

1. **数据库模型：**
```python
# PaymentRecord 添加字段
currency = Column(String(3), default='CNY')
```

2. **类型定义：**
```typescript
export type Currency = 'CNY' | 'USD'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  'CNY': '¥',
  'USD': '$',
}

export const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: 'CNY', label: '人民币', symbol: '¥' },
  { value: 'USD', label: '美元', symbol: '$' },
]
```

3. **表单添加货币选择器：**
- 两个按钮：CNY 和 USD
- 默认选中 CNY
- 可视化样式：选中时蓝色边框

4. **金额显示格式化：**
```typescript
function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '¥'
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
  return `${symbol}${formattedAmount}`
}
```

**注意：**
- SummaryCard.vue 未修改，因为它用于 Dashboard 统计卡片，暂时只显示单一货币的统计
- 后端重启后自动应用数据库模型更改

---

---

## 2026-02-10 个人中心 + 导入导出功能

### 需求描述：
- 添加个人中心页面，用户可以管理个人数据
- 支持导出所有记录为 JSON 格式
- 支持导入 JSON 格式的记录文件

### 后端 API

**实现状态：** ✅ 已完成

**新增文件：**
- `backend/app/api/profile.py` - 个人中心相关 API

**API 端点：**

1. **GET /api/v1/export** - 导出所有记录
   - 返回所有记录的 JSON 数据
   - 包含 SimpleRecord 和 PaymentRecord

2. **POST /api/v1/import** - 导入记录
   - 接收 JSON 文件
   - 验证并导入记录
   - 返回导入结果统计

**修改文件：**
- `backend/app/api/__init__.py` - 注册 profile 路由

### 前端功能

**实现状态：** ✅ 已完成

**新增文件：**
- `frontend/src/views/Profile.vue` - 个人中心页面

**修改文件：**
- `frontend/src/main.ts` - 添加个人中心路由

**页面功能：**
- 导出按钮：点击后下载所有记录的 JSON 文件
- 导入功能：
  - 支持上传 JSON 文件
  - 显示导入进度和结果
  - 成功导入后跳转到记录列表
- 数据统计：
  - 显示总记录数
  - 显示简单提醒数量
  - 显示收付款记录数量

### 导入导出格式

**导出格式（JSON）：**
```json
{
  "version": "1.0.0",
  "export_date": "2026-02-10T12:00:00Z",
  "records": [
    {
      "type": "simple",
      "title": "生日提醒",
      "date": "2026-03-15",
      "category": "生日",
      "repeat_type": "yearly",
      "days_before": 3
    },
    {
      "type": "payment",
      "title": "房租",
      "amount": 3000.00,
      "currency": "CNY",
      "date": "2026-02-01",
      "category": "居住",
      "payment_type": "outgoing",
      "repeat_type": "monthly"
    }
  ]
}
```

---

## 后续改进建议

1. **记录列表页**:
   - 添加排序功能（按时间、按金额）
   - 添加搜索功能
   - 添加批量操作（删除多个记录）

2. **Dashboard**:
   - 添加数据刷新时间显示
   - 添加快捷操作（直接从 Dashboard 创建记录）
   - 优化统计图表可视化

3. **日历视图**:
   - 添加拖拽修改日期
   - 添加快速创建记录（点击日期直接创建）
   - 添加更多视图选项（周视图、月视图、年视图）

4. **个人中心**:
   - 支持导出为 CSV 格式
   - 支持从 CSV 格式导入
   - 添加数据备份到云端功能
   - 添加用户设置（主题、语言等）
