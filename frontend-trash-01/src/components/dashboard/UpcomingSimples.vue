<script setup lang="ts">
import type { SimpleRecord } from '@/types'
import { formatDateWithNext } from '@/utils/formatDate'

interface Props {
  records: SimpleRecord[]
}

const props = defineProps<Props>()

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
  if (days <= 3) return 'text-red-600 bg-red-50 border-red-200'
  if (days <= 7) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-gray-500 bg-gray-50 border-gray-200'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div class="p-5 border-b border-gray-100 flex items-center justify-between">
      <div>
        <h2 class="font-bold text-gray-900">即将到来</h2>
        <p class="text-gray-500 text-sm mt-0.5">近期到期的提醒事项</p>
      </div>
      <button class="text-sm text-blue-600 font-medium hover:text-blue-700">
        添加
      </button>
    </div>
    
    <div v-if="records.length === 0" class="p-8 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-gray-500">暂无即将到来的记录</p>
      <button class="mt-3 text-blue-600 font-medium hover:text-blue-700">
        添加提醒
      </button>
    </div>
    
    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="record in records"
        :key="record.id"
        class="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg flex-shrink-0">
          📅
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900">{{ record.name }}</h3>
          <p class="text-sm text-gray-500">{{ getPeriodLabel(record.period) }}</p>
        </div>
        
        <div class="text-right">
          <p class="font-medium text-gray-900">
            {{ formatDateWithNext(record.next_occurrence || record.time) }}
          </p>
          <span
            class="inline-block px-2 py-0.5 rounded-full text-xs font-medium border"
            :class="getUrgencyClass(daysUntil(record.next_occurrence || record.time))"
          >
            {{ daysUntil(record.next_occurrence || record.time) }} 天后
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
