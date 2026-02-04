<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import TopPayments from '@/components/dashboard/TopPayments.vue'
import UpcomingSimples from '@/components/dashboard/UpcomingSimples.vue'

const dashboard = useDashboardStore()

onMounted(async () => {
  await dashboard.fetchAll()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

      <div v-if="dashboard.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <div v-else-if="dashboard.error" class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        加载失败: {{ dashboard.error }}
      </div>

      <div v-else>
        <div v-if="dashboard.hasPayments">
          <TopPayments :records="dashboard.topPayments" />
        </div>
        <div v-else>
          <UpcomingSimples :records="dashboard.upcomingSimples" />
        </div>

        <div v-if="dashboard.summary" class="mt-8 grid grid-cols-3 gap-4">
          <div class="bg-green-100 p-6 rounded-lg">
            <p class="text-green-800 text-sm font-medium">本月收入</p>
            <p class="text-2xl font-bold text-green-900 mt-2">
              ¥{{ dashboard.summary.income.toLocaleString() }}
            </p>
          </div>
          <div class="bg-red-100 p-6 rounded-lg">
            <p class="text-red-800 text-sm font-medium">本月支出</p>
            <p class="text-2xl font-bold text-red-900 mt-2">
              ¥{{ dashboard.summary.expense.toLocaleString() }}
            </p>
          </div>
          <div class="bg-blue-100 p-6 rounded-lg">
            <p class="text-blue-800 text-sm font-medium">结余</p>
            <p class="text-2xl font-bold text-blue-900 mt-2">
              ¥{{ dashboard.summary.balance.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
