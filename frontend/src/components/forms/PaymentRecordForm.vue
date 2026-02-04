<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRecordsStore } from '@/stores/records'
import { api } from '@/services/api'
import type { PaymentRecordCreate, Category, PaymentMethod, Direction } from '@/types'

const emit = defineEmits<{
  submit: [data: PaymentRecordCreate]
}>()

const records = useRecordsStore()

const form = reactive<PaymentRecordCreate>({
  name: '',
  description: undefined,
  direction: 'income',
  category: '',
  amount: 0,
  payment_method: '',
  period: 'natural-month',
  start_time: new Date().toISOString().slice(0, 16),
  end_time: undefined,
  notes: undefined,
})

const categories = ref<Category[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const isSubmitting = ref(false)

const periods = [
  { value: 'natural-month', label: '自然月' },
  { value: 'membership-month', label: '会员月' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年' },
]

const directions = [
  { value: 'income', label: '收入 ↗' },
  { value: 'expense', label: '支出 ↘' },
]

async function loadData() {
  try {
    [categories.value, paymentMethods.value] = await Promise.all([
      api.get<Category[]>('/api/v1/support/categories'),
      api.get<PaymentMethod[]>('/api/v1/support/payment-methods'),
    ])
  } catch (e) {
    console.error('Failed to load data:', e)
  }
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    await records.createPaymentRecord(form)
    emit('submit', form)
    resetForm()
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.description = undefined
  form.direction = 'income'
  form.category = ''
  form.amount = 0
  form.payment_method = ''
  form.period = 'natural-month'
  form.start_time = new Date().toISOString().slice(0, 16)
  form.end_time = undefined
  form.notes = undefined
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-2">
      <label class="block text-sm font-medium">名称 *</label>
      <input
        v-model="form.name"
        type="text"
        placeholder="例如：房租、工资"
        required
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">方向 *</label>
      <div class="flex gap-4">
        <label
          v-for="dir in directions"
          :key="dir.value"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            v-model="form.direction"
            type="radio"
            :value="dir.value"
            class="w-4 h-4"
          />
          <span :class="dir.value === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
            {{ dir.label }}
          </span>
        </label>
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">金额 *</label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
        <input
          v-model.number="form.amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
          class="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">分类 *</label>
      <select
        v-model="form.category"
        required
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">选择分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.name">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">付款方式 *</label>
      <select
        v-model="form.payment_method"
        required
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">选择付款方式</option>
        <option v-for="method in paymentMethods" :key="method.id" :value="method.name">
          {{ method.name }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium">开始时间 *</label>
        <input
          v-model="form.start_time"
          type="datetime-local"
          required
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium">结束时间</label>
        <input
          v-model="form.end_time"
          type="datetime-local"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">周期 *</label>
      <select
        v-model="form.period"
        required
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option v-for="period in periods" :key="period.value" :value="period.value">
          {{ period.label }}
        </option>
      </select>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">备注</label>
      <textarea
        v-model="form.notes"
        placeholder="添加备注信息（可选）"
        rows="3"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div class="flex gap-3">
      <button
        type="button"
        @click="resetForm"
        class="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
      >
        重置
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <span v-if="!isSubmitting">创建记录</span>
        <span v-else>创建中...</span>
      </button>
    </div>
  </form>
</template>
