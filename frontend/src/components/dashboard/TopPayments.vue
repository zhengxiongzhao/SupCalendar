<script setup lang="ts">
import type { PaymentRecord } from '@/types'

interface Props {
  records: PaymentRecord[]
}

const props = defineProps<Props>()

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function getDirectionColor(direction: 'income' | 'expense') {
  return direction === 'income' ? 'text-green-600' : 'text-red-600'
}

function getDirectionIcon(direction: 'income' | 'expense') {
  return direction === 'income' ? '↗️' : '↘️'
}
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">收付款 TOP 10</h2>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2 px-3 font-medium">名称</th>
            <th class="text-left py-2 px-3 font-medium">方向</th>
            <th class="text-right py-2 px-3 font-medium">金额</th>
            <th class="text-left py-2 px-3 font-medium">下次日期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id" class="border-b hover:bg-gray-50">
            <td class="py-3 px-3">{{ record.name }}</td>
            <td class="py-3 px-3">
              <span :class="getDirectionColor(record.direction)" class="font-medium">
                {{ getDirectionIcon(record.direction) }} {{ record.direction === 'income' ? '收入' : '支出' }}
              </span>
            </td>
            <td class="py-3 px-3 text-right font-mono">
              ¥{{ record.amount.toLocaleString() }}
            </td>
            <td class="py-3 px-3">
              {{ record.next_occurrence ? formatDate(record.next_occurrence) : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="records.length === 0" class="text-center py-8 text-gray-500">
        暂无收付款记录
      </div>
    </div>
  </div>
</template>
