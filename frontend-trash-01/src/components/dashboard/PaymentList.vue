<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { PaymentRecord } from '@/types'
import { CURRENCY_SYMBOLS } from '@/types'
import { formatDateWithNext, daysUntil, getUrgencyClass } from '@/utils/formatDate'

interface Props {
  records: PaymentRecord[]
}

const props = defineProps<Props>()
const router = useRouter()

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '¥'
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  return `${symbol}${formattedAmount}`
}

function navigateToCreate() {
  router.push('/create')
}

function navigateToEdit(id: string) {
  router.push(`/edit/${id}`)
}

function navigateToRecords() {
  router.push('/records?filter=payment')
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div class="p-5 border-b border-gray-100 flex items-center justify-between">
      <div>
        <h2 class="font-bold text-gray-900">收付款 TOP 10</h2>
        <p class="text-sm text-gray-500 mt-0.5">按金额排序</p>
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 3.666V14m-6.118 4.25l.677 1.444a1 1 0 001.802 0l.678-1.444M12 21a9 9 0 110-18 9 9 0 010 18z" />
        </svg>
      </div>
      <p class="text-gray-500">暂无收付款记录</p>
      <button
        @click="navigateToCreate"
        class="mt-3 text-blue-600 font-medium hover:text-blue-700"
      >
        添加一条
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
          :class="record.direction === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
        >
          {{ record.direction === 'income' ? '↗' : '↘' }}
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ record.name }}</p>
          <p class="text-sm text-gray-500">{{ record.category }}</p>
        </div>
        
        <div class="text-right">
          <p
            class="font-bold"
            :class="record.direction === 'income' ? 'text-green-600' : 'text-red-600'"
          >
            {{ record.direction === 'income' ? '+' : '-' }}{{ formatAmount(record.amount, record.currency) }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatDateWithNext(record.next_occurrence || '无') }}
          </p>
          <span
            v-if="record.next_occurrence"
            class="inline-block px-2 py-0.5 rounded-full text-xs font-medium border"
            :class="getUrgencyClass(daysUntil(record.next_occurrence))"
          >
            {{ daysUntil(record.next_occurrence) }} 天后
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
