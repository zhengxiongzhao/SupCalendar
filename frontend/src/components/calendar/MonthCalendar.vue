<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: Date
  events: Array<{ date: Date }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [date: Date]
}>()

const selectedDate = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const currentYear = ref(selectedDate.value.getFullYear())
const currentMonth = ref(selectedDate.value.getMonth())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

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
  const selectedStr = formatDateToString(selectedDate.value)

  const events = props.events.filter(e => formatDateToString(e.date) === dateStr)

  return {
    date,
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday: todayStr === dateStr,
    isSelected: selectedStr === dateStr,
    hasEvents: events.length > 0,
    eventCount: events.length,
  }
}

function formatDateToString(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function selectDate(date: Date) {
  selectedDate.value = date
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
}
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">
        {{ currentYear }}年 {{ currentMonth + 1 }}月
      </h2>
      <div class="flex gap-2">
        <button
          @click="prevMonth"
          class="px-3 py-1 border rounded hover:bg-gray-100 transition-colors"
        >
          <
        </button>
        <button
          @click="nextMonth"
          class="px-3 py-1 border rounded hover:bg-gray-100 transition-colors"
        >
          >
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in weekDays" :key="day" class="text-center text-sm font-medium text-gray-600">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        :class="[
          'aspect-square rounded-lg p-1 cursor-pointer transition-colors flex flex-col items-center justify-center',
          day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
          day.isSelected ? 'bg-blue-600 text-white' : 'hover:bg-blue-100',
          day.isToday && !day.isSelected ? 'ring-2 ring-blue-600' : '',
          day.hasEvents ? 'font-bold' : '',
          !day.isCurrentMonth ? 'text-gray-400' : ''
        ]"
        @click="selectDate(day.date)"
      >
        <span class="text-sm">{{ day.dayNumber }}</span>
        <div v-if="day.eventCount > 0" class="flex gap-0.5 mt-1">
          <div
            v-for="i in Math.min(day.eventCount, 3)"
            :key="i"
            class="w-1 h-1 rounded-full bg-current opacity-70"
          />
        </div>
      </div>
    </div>
  </div>
</template>
