<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRecordsStore } from '@/stores/records'
import type { SimpleRecordCreate } from '@/types'

const emit = defineEmits<{
  submit: [data: SimpleRecordCreate]
}>()

const records = useRecordsStore()

const form = reactive<SimpleRecordCreate>({
  name: '',
  time: new Date().toISOString().slice(0, 16),
  period: 'natural-month',
  description: undefined,
})

const isSubmitting = ref(false)

const periods = [
  { value: 'natural-month', label: '自然月' },
  { value: 'membership-month', label: '会员月' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '年' },
]

async function handleSubmit() {
  isSubmitting.value = true
  try {
    await records.createSimpleRecord(form)
    emit('submit', form)
    resetForm()
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.time = new Date().toISOString().slice(0, 16)
  form.period = 'natural-month'
  form.description = undefined
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-2">
      <label class="block text-sm font-medium">名称 *</label>
      <input
        v-model="form.name"
        type="text"
        placeholder="例如：会员续费提醒"
        required
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">时间 *</label>
      <input
        v-model="form.time"
        type="datetime-local"
        required
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">周期 *</label>
      <select
        v-model="form.period"
        required
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option v-for="period in periods" :key="period.value" :value="period.value">
          {{ period.label }}
        </option>
      </select>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium">描述</label>
      <textarea
        v-model="form.description"
        placeholder="添加详细描述（可选）"
        rows="3"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div class="flex gap-3">
      <button
        type="button"
        @click="resetForm"
        class="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
      >
        重置
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <span v-if="!isSubmitting">创建记录</span>
        <span v-else>创建中...</span>
      </button>
    </div>
  </form>
</template>
