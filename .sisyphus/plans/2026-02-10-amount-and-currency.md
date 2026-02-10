# 实现计划：金额可以为 0 + 货币类型支持

**创建时间：** 2026-02-10
**优先级：** 高/中
**状态：** ✅ 已完成

---

## 需求概述

### 1. 金额可以为 0（高优先级）
- 修改验证条件：`amount <= 0` → `amount < 0`
- 影响文件：PaymentRecordForm.vue, EditRecord.vue

### 2. 支持货币类型 CNY/USD（中优先级）
- 后端添加 currency 字段
- 前端添加货币选择和动态符号显示
- 影响文件：后端模型/schemas、前端类型/表单/显示组件

---

## 任务清单

### Phase 1: 金额可以为 0

- [x] 修改 PaymentRecordForm.vue 验证逻辑
- [x] 修改 EditRecord.vue 验证逻辑
- [ ] 测试金额为 0 的创建和编辑

### Phase 2: 后端 - 货币字段

- [x] PaymentRecord 模型添加 currency 字段
- [x] 所有 PaymentRecord 相关 schemas 添加 currency 字段
- [x] 创建数据库迁移（通过重启后端自动应用）

### Phase 3: 前端 - 类型定义

- [x] 添加 Currency 类型定义
- [x] 添加 CURRENCY_SYMBOLS 和 CURRENCY_OPTIONS 常量
- [x] PaymentRecord 类型添加 currency 字段

### Phase 4: 前端 - 表单修改

- [x] PaymentRecordForm 添加货币选择器
- [x] EditRecord 添加货币选择器
- [x] 表单数据模型添加 currency 字段（默认 CNY）

### Phase 5: 前端 - 显示组件更新

- [ ] SummaryCard.vue 支持动态货币符号（未修改，Dashboard 统计暂不支持多货币）
- [x] TopPayments.vue 支持动态货币符号
- [x] PaymentList.vue 支持动态货币符号
- [x] RecordsList.vue 支持动态货币符号
- [x] DayRecords.vue 支持动态货币符号
- [x] RecordList.vue 支持动态货币符号

### Phase 6: 验证和测试

- [ ] 创建 CNY 记录并验证显示
- [ ] 创建 USD 记录并验证显示
- [ ] 编辑记录切换货币类型
- [ ] 测试金额为 0 的各种场景

---

## 影响范围

### 后端文件
- `backend/app/models/record.py`
- `backend/app/schemas/record.py`

### 前端文件
- `frontend/src/types/index.ts`
- `frontend/src/components/forms/PaymentRecordForm.vue`
- `frontend/src/views/EditRecord.vue`
- `frontend/src/components/dashboard/SummaryCard.vue`
- `frontend/src/components/dashboard/TopPayments.vue`
- `frontend/src/components/dashboard/PaymentList.vue`
- `frontend/src/views/RecordsList.vue`
- `frontend/src/components/calendar/DayRecords.vue`
- `frontend/src/components/calendar/RecordList.vue`
