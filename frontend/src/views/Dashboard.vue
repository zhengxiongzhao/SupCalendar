<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import SummaryCard from '@/components/dashboard/SummaryCard.vue'
import PaymentList from '@/components/dashboard/PaymentList.vue'
import UpcomingList from '@/components/dashboard/UpcomingList.vue'

const router = useRouter()
const dashboard = useDashboardStore()

onMounted(async () => {
  await dashboard.fetchAll()
})

const currentMonth = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})

function navigateToCreate() {
  router.push('/create')
}

function navigateToCalendar() {
  router.push('/calendar')
}
</script>

<template>
  <div class="space-y-6 animate-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">财务概览</h1>
        <p class="text-gray-500 mt-1">{{ currentMonth }}</p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="navigateToCalendar"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="hidden sm:inline">查看日历</span>
        </button>
        <button 
          @click="navigateToCreate"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新建</span>
        </button>
      </div>
    </div>

    <div v-if="dashboard.loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <div v-else-if="dashboard.error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-red-600 font-medium">加载失败</p>
      <p class="text-red-500 text-sm mt-1">{{ dashboard.error }}</p>
      <button 
        @click="dashboard.fetchAll()"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        重试
      </button>
    </div>

    <template v-else>
      <div v-if="dashboard.summary" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="本月收入"
          :amount="dashboard.summary.income"
          type="income"
          icon="↗"
        />
        <SummaryCard
          title="本月支出"
          :amount="dashboard.summary.expense"
          type="expense"
          icon="↘"
        />
        <SummaryCard
          title="当前结余"
          :amount="dashboard.summary.balance"
          type="balance"
          icon="💰"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentList :records="dashboard.topPayments" />
        <UpcomingList :records="dashboard.upcomingSimples" />
      </div>
    </template>
  </div>
</template>
