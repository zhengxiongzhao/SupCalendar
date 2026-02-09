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
