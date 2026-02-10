<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecordsStore } from '@/stores/records'
import type { SimpleRecord, PaymentRecord, CalendarRecord } from '@/types'

const route = useRoute()
const router = useRouter()
const recordsStore = useRecordsStore()
const filter = ref<'all' | 'payment' | 'simple'>('all')

onMounted(async () => {
  // 从 URL query 参数读取筛选条件
  const filterParam = route.query.filter as string
  if (filterParam && ['payment', 'simple'].includes(filterParam)) {
    filter.value = filterParam as 'payment' | 'simple'
  }
  await recordsStore.fetchRecords()
})

// 监听筛选变化，更新 URL
watch(filter, (newFilter) => {
  if (newFilter === 'all') {
    router.replace({ query: {} })
  } else {
    router.replace({ query: { filter: newFilter } })
  }
})

const filteredRecords = computed(() => {
  if (filter.value === 'all') return recordsStore.records
  return recordsStore.records.filter((r): r is CalendarRecord => r.type === filter.value)
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  })
}

function getRecordIcon(record: SimpleRecord | PaymentRecord) {
  if (record.type === 'payment') {
    return (record as PaymentRecord).direction === 'income' ? '↗' : '↘'
  }
  return '📅'
}

function getRecordColor(record: SimpleRecord | PaymentRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.direction === 'income' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700'
  }
  return 'bg-blue-100 text-blue-700'
}

function getRecordAmount(record: SimpleRecord | PaymentRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return (r.direction === 'income' ? '+' : '-') + '¥' + r.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
  }
  return '提醒'
}

function getRecordSubtitle(record: SimpleRecord | PaymentRecord) {
  if (record.type === 'payment') {
    const r = record as PaymentRecord
    return r.category
  }
  return '简单提醒'
}

async function deleteRecord(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    await recordsStore.deleteRecord(id)
  }
}

function navigateToCreate() {
  router.push('/create')
}

function navigateToEdit(id: string) {
  router.push(`/edit/${id}`)
}
</script>

<template>
  <div class="space-y-6 animate-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">所有记录</h1>
      <button 
        @click="navigateToCreate"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新建记录
      </button>
    </div>
    
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        @click="filter = 'all'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'"
      >
        全部
      </button>
      <button
        @click="filter = 'payment'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="filter === 'payment' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'"
      >
        收付款
      </button>
      <button
        @click="filter = 'simple'"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        :class="filter === 'simple' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'"
      >
        简单提醒
      </button>
    </div>

    <div v-if="recordsStore.loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <div v-else-if="filteredRecords.length === 0" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="text-gray-500 text-lg">暂无记录</p>
      <p class="text-gray-400 text-sm mt-1">点击下方按钮创建第一条记录</p>
      <button 
        @click="navigateToCreate"
        class="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        新建记录
      </button>
    </div>

    <div v-else class="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        @click="navigateToEdit(record.id)"
        class="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group cursor-pointer"
      >
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          :class="getRecordColor(record)"
        >
          {{ getRecordIcon(record) }}
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">{{ record.name }}</p>
          <p class="text-sm text-gray-500">{{ getRecordSubtitle(record) }}</p>
        </div>
        
        <div class="text-right">
          <p 
            class="font-bold"
            :class="record.type === 'payment' && (record as PaymentRecord).direction === 'income' ? 'text-green-600' : 'text-gray-900'"
          >
            {{ getRecordAmount(record) }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatDate(record.created_at) }}
          </p>
        </div>
        
        <div class="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            @click.stop="navigateToEdit(record.id)"
            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click.stop="deleteRecord(record.id)"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
