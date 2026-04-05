<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: Date
  events: Array<{ date: Date }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [date: Date]
  'monthChange': [year: number, month: number]
}>()

const currentYear = ref(props.modelValue.getFullYear())
const currentMonth = ref(props.modelValue.getMonth())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long' 
  })
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  
  const days = []
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, lastDay.getDate() - i)
    days.push(createDayData(date, false))
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push(createDayData(date, true))
  }
  
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push(createDayData(date, false))
  }
  
  return days
})

function createDayData(date: Date, isCurrentMonth: boolean) {
  const today = new Date()
  const todayStr = formatDateToString(today)
  const dateStr = formatDateToString(date)
  const selectedStr = formatDateToString(props.modelValue)
  
  const dayEvents = props.events.filter(e => formatDateToString(e.date) === dateStr)
  
  return {
    date,
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday: todayStr === dateStr,
    isSelected: selectedStr === dateStr,
    hasEvents: dayEvents.length > 0,
    eventCount: dayEvents.length
  }
}

function formatDateToString(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function selectDate(date: Date) {
  emit('update:modelValue', date)
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
  emit('monthChange', currentYear.value, currentMonth.value)
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
  emit('monthChange', currentYear.value, currentMonth.value)
}

function goToToday() {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectDate(today)
  emit('monthChange', currentYear.value, currentMonth.value)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">{{ monthName }}</h2>
      <div class="flex items-center gap-2">
        <button
          @click="goToToday"
          class="hidden sm:block px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          今天
        </button>
        <button
          @click="prevMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="nextMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div 
        v-for="day in weekDays" 
        :key="day"
        class="text-center text-sm font-medium py-2"
        :class="day === '日' || day === '六' ? 'text-red-500' : 'text-gray-500'"
      >
        {{ day }}
      </div>
    </div>
    
    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        @click="selectDate(day.date)"
        class="relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all touch-manipulation"
        :class="[
          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300',
          day.isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100',
          day.isToday && !day.isSelected ? 'ring-2 ring-blue-600 ring-inset' : ''
        ]"
      >
        <span>{{ day.dayNumber }}</span>
        <div v-if="day.hasEvents" class="flex gap-0.5 mt-1">
          <div
            v-for="i in Math.min(day.eventCount, 3)"
            :key="i"
            class="w-1.5 h-1.5 rounded-full"
            :class="day.isSelected ? 'bg-white' : 'bg-blue-600'"
          />
        </div>
      </button>
    </div>
  </div>
</template>
