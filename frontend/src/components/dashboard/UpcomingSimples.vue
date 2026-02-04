<script setup lang="ts">
import type { SimpleRecord } from '@/types'

interface Props {
  records: SimpleRecord[]
}

const props = defineProps<Props>()

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
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
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">即将到来</h2>
    <div class="space-y-3">
      <div
        v-for="record in records"
        :key="record.id"
        class="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
      >
        <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
          📅
        </div>
        <div class="flex-1">
          <h3 class="font-medium">{{ record.name }}</h3>
          <p class="text-sm text-gray-500">
            {{ getPeriodLabel(record.period) }}
            <span v-if="record.description" class="ml-2">• {{ record.description }}</span>
          </p>
        </div>
        <div class="text-right">
          <p class="font-medium">{{ formatDate(record.time) }}</p>
          <p class="text-sm text-gray-500">{{ daysUntil(record.time) }} 天后</p>
        </div>
      </div>
      <div v-if="records.length === 0" class="text-center py-8 text-gray-500">
        暂无即将到来的记录
      </div>
    </div>
  </div>
</template>
