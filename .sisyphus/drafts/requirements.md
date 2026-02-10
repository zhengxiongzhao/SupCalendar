# SupCalandar 需求文档

## 已完成需求

### 金额显示格式化

**需求描述：**
- 金额默认保留 2 位小数
- 最大支持 6 位小数（如 1000.123456）
- 显示千位分隔符（逗号）

**实现状态：** ✅ 已完成

**解决方案：**

所有金额显示组件统一使用格式化：
```typescript
amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
```

**涉及的组件：**
1. `frontend/src/components/dashboard/SummaryCard.vue`
2. `frontend/src/components/dashboard/TopPayments.vue`
3. `frontend/src/components/dashboard/PaymentList.vue`
4. `frontend/src/views/RecordsList.vue`
5. `frontend/src/components/calendar/DayRecords.vue`
6. `frontend/src/components/calendar/RecordList.vue`

**显示效果示例：**
- `1000` → `1,000.00`
- `1000.5` → `1,000.50`
- `1000.123456` → `1,000.123456`
- `10000.789` → `10,000.789`

---

## 待实现需求

### 金额可以为 0

**需求描述：**
- 收付款记录的金额允许设置为 0
- 当前验证逻辑阻止了金额为 0（`amount <= 0`）
- 需要修改验证条件为 `amount < 0`

**影响范围：**
- `frontend/src/components/forms/PaymentRecordForm.vue` - 创建表单
- `frontend/src/views/EditRecord.vue` - 编辑页面

**当前问题：**
```typescript
// PaymentRecordForm.vue:121-124
if (form.amount <= 0) {
  error.value = '请输入有效金额'
  return
}
```

**修改方案：**
```typescript
// 改为
if (form.amount < 0) {
  error.value = '请输入有效金额'
  return
}
```

---

### 支持货币类型（CNY / USD）

**需求描述：**
- 允许用户选择货币类型：CNY（人民币）或 USD（美元）
- 货币符号动态显示（¥ 或 $）
- 每个记录可以独立设置货币类型

**影响范围：**
- 后端：
  - `backend/app/models/record.py` - PaymentRecord 模型添加 `currency` 字段
  - `backend/app/schemas/record.py` - schemas 添加 `currency` 字段
- 前端类型：
  - `frontend/src/types/index.ts` - 类型定义
- 前端表单：
  - `frontend/src/components/forms/PaymentRecordForm.vue` - 创建表单
  - `frontend/src/views/EditRecord.vue` - 编辑页面
- 前端显示：
  - 所有金额显示组件（6个）

**实现方案：**

1. **数据库模型添加字段：**
```python
# backend/app/models/record.py
class PaymentRecord(BaseRecord):
    # ... 现有字段
    currency: Mapped[str] = mapped_column(String(3), default='CNY')
```

2. **添加货币类型定义：**
```typescript
// frontend/src/types/index.ts
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

3. **表单添加货币选择：**
```vue
<div>
  <label class="block text-sm font-medium text-gray-700 mb-2">
    货币类型
  </label>
  <div class="grid grid-cols-2 gap-3">
    <button
      v-for="currency in CURRENCY_OPTIONS"
      :key="currency.value"
      @click="form.currency = currency.value"
      class="px-4 py-3 rounded-xl border-2 text-center font-medium transition-all"
      :class="form.currency === currency.value
        ? 'border-blue-600 bg-blue-50 text-blue-600'
        : 'border-gray-200 hover:border-gray-300 text-gray-700'"
    >
      {{ currency.symbol }} {{ currency.label }}
    </button>
  </div>
</div>
```

4. **金额显示使用动态符号：**
```typescript
function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency as Currency] || '¥'
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
  return `${symbol}${formattedAmount}`
}
```

**优先级：**
- 金额可以为 0：高（简单修改，影响用户体验）
- 货币类型：中（需要数据库迁移和较多代码修改）
