<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecordsStore } from '@/stores/records'
import MonthCalendar from '@/components/calendar/MonthCalendar.vue'
import DayRecords from '@/components/calendar/DayRecords.vue'
import type { SimpleRecord, PaymentRecord } from '@/types'

const router = useRouter()
const recordsStore = useRecordsStore()

const selectedDate = ref(new Date())
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

onMounted(async () => {
  await recordsStore.fetchRecords()
})

const calendarEvents = computed(() => {
  return recordsStore.records.map((record): { date: Date } => {
    const dateStr = record.type === 'simple'
      ? (record as SimpleRecord).time
      : (record as PaymentRecord).start_time
    return { date: new Date(dateStr) }
  })
})

const selectedDateRecords = computed(() => {
  const dateStr = selectedDate.value.toDateString()
  return recordsStore.records.filter((record): boolean => {
    const recordDateStr = record.type === 'simple'
      ? new Date((record as SimpleRecord).time).toDateString()
      : new Date((record as PaymentRecord).start_time).toDateString()
    return recordDateStr === dateStr
  })
})

function navigateToCreate() {
  router.push('/create')
}

function onDateSelect(date: Date) {
  selectedDate.value = date
}

function onMonthChange(year: number, month: number) {
  currentYear.value = year
  currentMonth.value = month
}
</script>

<template>
  <div class="space-y-6 animate-in">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">日历视图</h1>
      <button 
        @click="navigateToCreate"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">新建记录</span>
      </button>
    </div>

    <div v-if="recordsStore.loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <MonthCalendar
          v-model="selectedDate"
          :events="calendarEvents"
          @update:modelValue="onDateSelect"
          @monthChange="onMonthChange"
        />
      </div>
      
      <div>
        <DayRecords 
          :date="selectedDate" 
          :records="selectedDateRecords"
          @create="navigateToCreate"
        />
      </div>
    </div>
  </div>
</template>
