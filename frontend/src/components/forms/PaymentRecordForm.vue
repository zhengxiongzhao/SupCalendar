<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRecordsStore } from '@/stores/records'
import { api } from '@/services/api'
import ComboInput from '@/components/common/ComboInput.vue'
import type { PaymentRecordCreate, Category, PaymentMethod, PeriodType } from '@/types'

const emit = defineEmits<{
  submit: []
}>()

const records = useRecordsStore()

const form = reactive<PaymentRecordCreate>({
  name: '',
  description: '',
  direction: 'expense',
  category: '',
  amount: 0,
  payment_method: '',
  period: 'natural-month',
  start_time: new Date().toISOString().slice(0, 16),
  end_time: '',
  notes: '',
})

const categories = ref<Category[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const isSubmitting = ref(false)
const error = ref('')
const isLoadingData = ref(true)

const periods: { value: PeriodType; label: string }[] = [
  { value: 'natural-month', label: '自然月' },
  { value: 'membership-month', label: '会员月' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年' },
]

const categoryOptions = computed(() => categories.value.map(c => c.name))
const paymentMethodOptions = computed(() => paymentMethods.value.map(m => m.name))

const isEndTimeManuallySet = ref(false)

function calculateEndTime(startTime: string, period: PeriodType): string {
  if (!startTime) return ''
  
  // 解析日期部分，忽略时间
  const startDate = new Date(startTime)
  const year = startDate.getFullYear()
  const month = startDate.getMonth()
  const date = startDate.getDate()
  
  // 创建新的日期对象，只保留日期部分（时间设为 00:00）
  const end = new Date(year, month, date)
  
  switch (period) {
    case 'natural-month':
      end.setMonth(end.getMonth() + 1)
      break
    case 'membership-month':
      end.setMonth(end.getMonth() + 1)
      break
    case 'quarter':
      end.setMonth(end.getMonth() + 3)
      break
    case 'year':
      end.setFullYear(end.getFullYear() + 1)
      break
  }
  
  // 转换为本地时间的 ISO 字符串格式
  const endYear = end.getFullYear()
  const endMonth = String(end.getMonth() + 1).padStart(2, '0')
  const endDate = String(end.getDate()).padStart(2, '0')
  
  return `${endYear}-${endMonth}-${endDate}T00:00`
}

watch(() => form.period, (newPeriod) => {
  if (form.start_time && !isEndTimeManuallySet.value) {
    form.end_time = calculateEndTime(form.start_time, newPeriod)
  }
})

watch(() => form.start_time, (newStartTime) => {
  if (newStartTime && !isEndTimeManuallySet.value) {
    form.end_time = calculateEndTime(newStartTime, form.period)
  }
})

function onEndTimeInput() {
  isEndTimeManuallySet.value = true
}

onMounted(async () => {
  try {
    const [cats, methods] = await Promise.all([
      api.get<Category[]>('/api/v1/support/categories'),
      api.get<PaymentMethod[]>('/api/v1/support/payment-methods'),
    ])
    categories.value = cats
    paymentMethods.value = methods
  } catch (e) {
    console.error('Failed to load data:', e)
  } finally {
    isLoadingData.value = false
  }
  
  // 初始化时自动计算结束时间
  if (form.start_time && !form.end_time) {
    form.end_time = calculateEndTime(form.start_time, form.period)
  }
})

async function handleSubmit() {
  if (!form.name.trim()) {
    error.value = '请输入名称'
    return
  }
  if (form.amount <= 0) {
    error.value = '请输入有效金额'
    return
  }
  if (!form.category) {
    error.value = '请选择或输入分类'
    return
  }
  if (!form.payment_method) {
    error.value = '请选择或输入付款方式'
    return
  }
  
  error.value = ''
  isSubmitting.value = true
  
  try {
    await records.createPaymentRecord({
      ...form,
      description: form.description || undefined,
      end_time: form.end_time || undefined,
      notes: form.notes || undefined,
    })
    emit('submit')
    resetForm()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '创建失败'
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.direction = 'expense'
  form.category = ''
  form.amount = 0
  form.payment_method = ''
  form.period = 'natural-month'
  form.start_time = new Date().toISOString().slice(0, 16)
  form.end_time = ''
  form.notes = ''
  isEndTimeManuallySet.value = false
  
  // 重置后自动计算结束时间
  form.end_time = calculateEndTime(form.start_time, form.period)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div v-if="isLoadingData" class="text-center py-4">
      <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm text-gray-500 mt-2">加载数据中...</p>
    </div>
    
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
      {{ error }}
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        记录名称
      </label>
      <input
        v-model="form.name"
        type="text"
        placeholder="例如：房租、工资"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        类型
      </label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          @click="form.direction = 'income'"
          class="px-4 py-3 rounded-xl border-2 text-center font-medium transition-all flex items-center justify-center gap-2"
          :class="form.direction === 'income' 
            ? 'border-green-500 bg-green-50 text-green-600' 
            : 'border-gray-200 hover:border-gray-300 text-gray-700'"
        >
          <span class="text-xl">↗</span>
          收入
        </button>
        <button
          type="button"
          @click="form.direction = 'expense'"
          class="px-4 py-3 rounded-xl border-2 text-center font-medium transition-all flex items-center justify-center gap-2"
          :class="form.direction === 'expense' 
            ? 'border-red-500 bg-red-50 text-red-600' 
            : 'border-gray-200 hover:border-gray-300 text-gray-700'"
        >
          <span class="text-xl">↘</span>
          支出
        </button>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        金额
      </label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
        <input
          v-model.number="form.amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          分类
        </label>
        <ComboInput
          v-model="form.category"
          :options="categoryOptions"
          placeholder="输入或选择分类"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          付款方式
        </label>
        <ComboInput
          v-model="form.payment_method"
          :options="paymentMethodOptions"
          placeholder="输入或选择付款方式"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          开始时间
        </label>
        <input
          v-model="form.start_time"
          type="datetime-local"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          结束时间
          <span v-if="!isEndTimeManuallySet && form.end_time" class="text-xs text-green-600 ml-2">(自动计算)</span>
          <span v-else class="text-xs text-gray-400 ml-2">(可手动修改)</span>
        </label>
        <input
          v-model="form.end_time"
          @input="onEndTimeInput"
          type="datetime-local"
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          :class="{ 'bg-green-50 border-green-200': !isEndTimeManuallySet && form.end_time }"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        重复周期
      </label>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="period in periods"
          :key="period.value"
          type="button"
          @click="form.period = period.value"
          class="px-4 py-3 rounded-xl border-2 text-center font-medium transition-all"
          :class="form.period === period.value 
            ? 'border-blue-600 bg-blue-50 text-blue-600' 
            : 'border-gray-200 hover:border-gray-300 text-gray-700'"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        备注（可选）
      </label>
      <textarea
        v-model="form.notes"
        placeholder="添加备注信息..."
        rows="3"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
      />
    </div>

    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="resetForm"
        class="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        重置
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <svg v-if="isSubmitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSubmitting ? '创建中...' : '创建记录' }}
      </button>
    </div>
  </form>
</template>
