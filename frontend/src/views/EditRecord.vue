<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecordsStore } from '@/stores/records'
import { api } from '@/services/api'
import ComboInput from '@/components/common/ComboInput.vue'
import type {
  Category,
  PaymentMethod,
  PeriodType,
  Direction,
  SimpleRecord,
  PaymentRecord
} from '@/types'
import { CURRENCY_OPTIONS } from '@/types'

const route = useRoute()
const router = useRouter()
const recordsStore = useRecordsStore()

const recordId = computed(() => route.params.id as string)
const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const recordType = ref<'simple' | 'payment'>('payment')

const form = reactive({
  name: '',
  description: '',
  direction: 'expense' as Direction,
  category: '',
  amount: 0,
  payment_method: '',
  period: 'month' as PeriodType,
  time: new Date().toISOString().slice(0, 16),
  start_time: new Date().toISOString().slice(0, 16),
  end_time: '',
  notes: '',
  currency: 'CNY',
})

const categories = ref<Category[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const isEndTimeManuallySet = ref(false)

const periods: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'half-year', label: '半年' },
  { value: 'year', label: '年' },
]

const categoryOptions = computed(() => categories.value.map(c => c.name))
const paymentMethodOptions = computed(() => paymentMethods.value.map(m => m.name))

onMounted(async () => {
  try {
    const [cats, methods] = await Promise.all([
      api.get<Category[]>('/api/v1/support/categories'),
      api.get<PaymentMethod[]>('/api/v1/support/payment-methods'),
    ])
    categories.value = cats
    paymentMethods.value = methods

    await recordsStore.fetchRecords()
    const record = recordsStore.getRecordById(recordId.value)
    
    if (!record) {
      error.value = '记录不存在'
      isLoading.value = false
      return
    }

    recordType.value = record.type

    if (record.type === 'simple') {
      const simpleRecord = record as SimpleRecord
      form.name = simpleRecord.name
      form.time = simpleRecord.time.slice(0, 16)
      form.period = simpleRecord.period
      form.description = simpleRecord.description || ''
    } else {
      const paymentRecord = record as PaymentRecord
      form.name = paymentRecord.name
      form.description = paymentRecord.description || ''
      form.direction = paymentRecord.direction
      form.category = paymentRecord.category
      form.amount = paymentRecord.amount
      form.payment_method = paymentRecord.payment_method
      form.period = paymentRecord.period
      form.start_time = paymentRecord.start_time.slice(0, 16)
      form.end_time = paymentRecord.end_time ? paymentRecord.end_time.slice(0, 16) : ''
      form.notes = paymentRecord.notes || ''
      form.currency = paymentRecord.currency || 'CNY'
    }
  } catch (e) {
    console.error('Failed to load data:', e)
    error.value = '加载数据失败'
  } finally {
    isLoading.value = false
  }
})

function onEndTimeInput() {
  isEndTimeManuallySet.value = true
}

async function handleSubmit() {
  if (!form.name.trim()) {
    error.value = '请输入名称'
    return
  }
  if (recordType.value === 'payment' && form.amount < 0) {
    error.value = '请输入有效金额'
    return
  }
  
  error.value = ''
  isSubmitting.value = true
  
  try {
    if (recordType.value === 'simple') {
      await recordsStore.updateSimpleRecord(recordId.value, {
        name: form.name,
        time: form.time,
        period: form.period,
        description: form.description || undefined,
      })
    } else {
      await recordsStore.updatePaymentRecord(recordId.value, {
        name: form.name,
        description: form.description || undefined,
        direction: form.direction,
        category: form.category,
        amount: form.amount,
        payment_method: form.payment_method,
        period: form.period,
        start_time: form.start_time,
        end_time: form.end_time || undefined,
        notes: form.notes || undefined,
        currency: form.currency,
      })
    }
    router.push('/records')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '更新失败'
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="max-w-2xl mx-auto animate-in">
    <div class="flex items-center gap-4 mb-6">
      <button 
        @click="goBack"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">编辑记录</h1>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <div v-else-if="error && !isSubmitting" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
      <svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button 
        @click="router.push('/records')"
        class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        返回列表
      </button>
    </div>
    
    <div v-else class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-5">
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

          <template v-if="recordType === 'payment'">
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
                货币类型
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="currency in CURRENCY_OPTIONS"
                  :key="currency.value"
                  type="button"
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
          </template>

          <template v-else>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                提醒时间
              </label>
              <input
                v-model="form.time"
                type="datetime-local"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                备注（可选）
              </label>
              <textarea
                v-model="form.description"
                placeholder="添加详细描述..."
                rows="3"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              />
            </div>
          </template>

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

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="goBack"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
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
              {{ isSubmitting ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
