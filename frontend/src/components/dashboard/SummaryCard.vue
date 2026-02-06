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
  <div class="p-5 rounded-2xl border transition-all duration-200 hover:shadow-md" :class="colors[type]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium opacity-80">{{ title }}</p>
        <p class="text-2xl font-bold mt-1">
          ¥{{ amount.toLocaleString() }}
        </p>
      </div>
      <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" :class="iconBgColors[type]">
        {{ icon }}
      </div>
    </div>
  </div>
</template>
