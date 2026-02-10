<script setup lang="ts">
import type { PaymentRecord } from '@/types'

interface Props {
  records: PaymentRecord[]
}

const props = defineProps<Props>()

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function getIcon(direction: 'income' | 'expense') {
  return direction === 'income' ? '↗' : '↘'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div class="p-5 border-b border-gray-100 flex items-center justify-between">
      <div>
        <h2 class="font-bold text-gray-900">收付款 TOP 10</h2>
        <p class="text-gray-500 text-sm mt-0.5">按金额排序的重要交易</p>
      </div>
      <button class="text-sm text-blue-600 font-medium hover:text-blue-700">
        查看全部
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">交易</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">金额</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">下次日期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  :class="record.direction === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                >
                  {{ getIcon(record.direction) }}
                </div>
                <span class="font-medium text-gray-900">{{ record.name }}</span>
              </div>
            </td>
            <td class="py-3 px-4">
              <span :class="record.direction === 'income' ? 'text-green-600' : 'text-red-600'" class="font-medium text-sm">
                {{ record.direction === 'income' ? '收入' : '支出' }}
              </span>
            </td>
            <td class="py-3 px-4 text-right font-mono font-bold" :class="record.direction === 'income' ? 'text-green-600' : 'text-red-600'">
              {{ record.direction === 'income' ? '+' : '-' }}¥{{ record.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) }}
            </td>
            <td class="py-3 px-4 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="record.direction === 'income' ? 'bg-green-500' : 'bg-red-500'"></span>
                {{ record.next_occurrence ? formatDate(record.next_occurrence) : '-' }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="records.length === 0" class="text-center py-8">
        <div class="text-5xl mb-4 opacity-30">📋</div>
        <p class="text-gray-500">暂无收付款记录</p>
        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">添加第一条记录</button>
      </div>
    </div>
  </div>
</template>
