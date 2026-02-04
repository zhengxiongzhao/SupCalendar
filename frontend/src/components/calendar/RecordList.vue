<script setup lang="ts">
import type { Record, PaymentRecord, SimpleRecord } from '@/types'

interface Props {
  date: Date
  records: Record[]
}

const props = defineProps<Props>()

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getIconBgClass(record: Record) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
  }
  return 'bg-blue-100 text-blue-600'
}

function getIconName(record: Record) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' ? '📥' : '📤'
  }
  return '📌'
}

function getBadgeVariant(direction: 'income' | 'expense') {
  return direction === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">{{ formatDate(date) }}</h2>

    <div v-if="records.length === 0" class="text-center py-8 text-gray-500">
      📅 这一天没有记录
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="record in sortedRecords()"
        :key="record.id"
        class="p-4 rounded-lg border hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div :class="['w-12 h-12 rounded-lg flex items-center justify-center text-xl', getIconBgClass(record)]">
            {{ getIconName(record) }}
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">{{ record.name }}</h3>
              <span
                v-if="record.type === 'payment'"
                :class="['px-2 py-1 rounded text-xs font-medium', getBadgeVariant((record as PaymentRecord).direction)]"
              >
                ¥{{ (record as PaymentRecord).amount.toLocaleString() }}
              </span>
            </div>
            <p v-if="record.type === 'payment' && (record as PaymentRecord).description" class="text-sm text-gray-500 mt-1">
              {{ (record as PaymentRecord).description }}
            </p>
            <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>
                {{
                  record.type === 'simple'
                    ? formatTime((record as SimpleRecord).time)
                    : formatTime((record as PaymentRecord).start_time)
                }}
              </span>
              <span v-if="record.type === 'payment'">• {{ (record as PaymentRecord).category }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
