<script setup lang="ts">
import type { CalendarRecord, PaymentRecord, SimpleRecord } from '@/types'
import { CURRENCY_SYMBOLS } from '@/types'

interface Props {
  date: Date
  records: CalendarRecord[]
}

const props = defineProps<Props>()

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getIcon(record: CalendarRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' ? '↗' : '↘'
  }
  return '📌'
}

function getIconBgClass(record: CalendarRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income'
      ? 'bg-green-100 text-green-600'
      : 'bg-red-100 text-red-600'
  }
  return 'bg-blue-100 text-blue-600'
}

function getAmountClass(record: CalendarRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' ? 'text-green-600' : 'text-red-600'
  }
  return 'text-amber-600'
}

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '¥'
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  return `${symbol}${formattedAmount}`
}

function getAmount(record: CalendarRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return (r.direction === 'income' ? '+' : '-') + formatAmount(r.amount, r.currency || 'CNY')
  }
  return '提醒'
}

function sortedRecords() {
  return [...props.records].sort((a, b) => {
    const dateA = new Date(a.type === 'simple' ? (a as SimpleRecord).time : (a as PaymentRecord).start_time)
    const dateB = new Date(b.type === 'simple' ? (b as SimpleRecord).time : (b as PaymentRecord).start_time)
    return dateA.getTime() - dateB.getTime()
  })
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div class="p-5 border-b border-gray-100">
      <h2 class="font-bold text-xl text-gray-900">{{ formatDate(date) }}</h2>
      <p class="text-gray-500 text-sm mt-1">
        {{ records.length }} 条记录
      </p>
    </div>

    <div class="p-4">
      <div v-if="records.length === 0" class="text-center py-8">
        <div class="text-5xl mb-4 opacity-30">📅</div>
        <p class="text-gray-500">这一天没有记录</p>
        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">添加记录</button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="record in sortedRecords()"
          :key="record.id"
          class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            :class="getIconBgClass(record)"
          >
            {{ getIcon(record) }}
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900">
              {{ record.name }}
            </h3>
            <div class="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
              <span>{{ formatTime(record.type === 'simple' ? (record as SimpleRecord).time : (record as PaymentRecord).start_time) }}</span>
              <span v-if="record.type === 'payment' && (record as PaymentRecord).category" class="px-2 py-0.5 rounded-full bg-gray-100 text-xs">
                {{ (record as PaymentRecord).category }}
              </span>
            </div>
            <p v-if="record.type === 'payment' && (record as PaymentRecord).description" class="text-sm text-gray-400 mt-1 truncate">
              {{ (record as PaymentRecord).description }}
            </p>
          </div>

          <div class="text-right flex-shrink-0">
            <p class="font-bold" :class="getAmountClass(record)">
              {{ getAmount(record) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
