<script setup lang="ts">
import type { Record, SimpleRecord, PaymentRecord } from '@/types'

interface Props {
  date: Date
  records: Record[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  create: []
}>()

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getRecordIcon(record: Record) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' ? '↗' : '↘'
  }
  return '📅'
}

function getRecordColor(record: Record) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700'
  }
  return 'bg-blue-100 text-blue-700'
}

function getRecordAmount(record: Record) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return (r.direction === 'income' ? '+' : '-') + '¥' + r.amount.toLocaleString()
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
      <h3 class="font-bold text-gray-900">{{ formatDate(date) }}</h3>
      <p class="text-sm text-gray-500 mt-0.5">{{ records.length }} 条记录</p>
    </div>
    
    <div v-if="records.length === 0" class="p-8 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="text-gray-500">这一天没有记录</p>
      <button 
        @click="emit('create')"
        class="mt-3 text-blue-600 font-medium hover:text-blue-700"
      >
        添加记录
      </button>
    </div>
    
    <div v-else class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
      <div
        v-for="record in sortedRecords()"
        :key="record.id"
        class="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          :class="getRecordColor(record)"
        >
          {{ getRecordIcon(record) }}
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ record.name }}</p>
          <p class="text-sm text-gray-500">
            {{ record.type === 'simple' 
              ? formatTime((record as SimpleRecord).time)
              : formatTime((record as PaymentRecord).start_time)
            }}
          </p>
        </div>
        
        <span 
          class="font-bold"
          :class="record.type === 'payment' && (record as PaymentRecord).direction === 'income' ? 'text-green-600' : 'text-gray-900'"
        >
          {{ getRecordAmount(record) }}
        </span>
      </div>
    </div>
  </div>
</template>
