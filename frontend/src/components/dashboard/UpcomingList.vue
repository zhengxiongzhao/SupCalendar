<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { CalendarRecord, SimpleRecord, PaymentRecord } from '@/types'

interface Props {
  records: CalendarRecord[]
}

const props = defineProps<Props>()
const router = useRouter()

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function daysUntil(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

function getPeriodLabel(period: string) {
  const labels: Record<string, string> = {
    'natural-month': '自然月',
    'membership-month': '会员月',
    'quarter': '季度',
    'year': '年'
  }
  return labels[period] || period
}

function getUrgencyClass(days: number) {
  if (days <= 3) return 'bg-red-100 text-red-700'
  if (days <= 7) return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

function getRecordIcon(record: CalendarRecord) {
  if (record.type === 'payment') {
    return (record as PaymentRecord).direction === 'income' ? '↗' : '↘'
  }
  return '📅'
}

function getRecordColor(record: CalendarRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700'
  }
  return 'bg-blue-100 text-blue-600'
}

function getRecordSubtitle(record: CalendarRecord) {
  if (record.type === 'payment') {
    return (record as PaymentRecord).category
  }
  return getPeriodLabel((record as SimpleRecord).period)
}

function getDisplayTime(record: CalendarRecord): string {
  if (record.next_occurrence) {
    return record.next_occurrence
  }
  return record.type === 'payment'
    ? (record as PaymentRecord).next_occurrence || (record as PaymentRecord).start_time
    : (record as SimpleRecord).time
}

function navigateToCreate() {
  router.push('/create')
}

function navigateToEdit(id: string) {
  router.push(`/edit/${id}`)
}

function navigateToRecords() {
  router.push('/records')
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div class="p-5 border-b border-gray-100 flex items-center justify-between">
      <div>
        <h2 class="font-bold text-gray-900">即将到来</h2>
        <p class="text-sm text-gray-500 mt-0.5">近期提醒事项</p>
      </div>
      <button
        @click="navigateToRecords"
        class="text-sm text-blue-600 font-medium hover:text-blue-700"
      >
        查看全部
      </button>
    </div>

    <div v-if="records.length === 0" class="p-8 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-gray-500">暂无即将到来的记录</p>
      <button
        @click="navigateToCreate"
        class="mt-3 text-blue-600 font-medium hover:text-blue-700"
      >
        添加提醒
      </button>
    </div>

    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="record in records"
        :key="record.id"
        @click="navigateToEdit(record.id)"
        class="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          :class="getRecordColor(record)"
        >
          {{ getRecordIcon(record) }}
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ record.name }}</p>
          <p class="text-sm text-gray-500">{{ getRecordSubtitle(record) }}</p>
        </div>

        <div class="text-right">
          <p class="font-medium text-gray-900">
            {{ formatDate(getDisplayTime(record)) }}
          </p>
          <span
            class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
            :class="getUrgencyClass(daysUntil(getDisplayTime(record)))"
          >
            {{ daysUntil(getDisplayTime(record)) }} 天后
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
