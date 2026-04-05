<script setup lang="ts">
interface Props {
  title: string
  amount: number
  type: 'income' | 'expense' | 'balance'
  icon: string
}

const props = defineProps<Props>()

const colors = {
  income: 'bg-green-50 border-green-200 text-green-700',
  expense: 'bg-red-50 border-red-200 text-red-700',
  balance: 'bg-blue-50 border-blue-200 text-blue-700'
}

const iconBgColors = {
  income: 'bg-green-100 text-green-600',
  expense: 'bg-red-100 text-red-600',
  balance: 'bg-blue-100 text-blue-600'
}
</script>

<template>
  <div class="p-3 rounded-xl border transition-all duration-200 hover:shadow-md" :class="colors[type]">
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0">
        <p class="text-xs font-medium opacity-70">{{ title }}</p>
        <p class="text-lg font-bold mt-0.5 truncate">
          ¥{{ amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) }}
        </p>
      </div>
      <div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" :class="iconBgColors[type]">
        {{ icon }}
      </div>
    </div>
  </div>
</template>
