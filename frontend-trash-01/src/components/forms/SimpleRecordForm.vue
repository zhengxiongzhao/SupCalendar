<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRecordsStore } from '@/stores/records'
import type { SimpleRecordCreate, PeriodType } from '@/types'

const emit = defineEmits<{
  submit: []
}>()

const records = useRecordsStore()

const form = reactive<SimpleRecordCreate>({
  name: '',
  time: new Date().toISOString().slice(0, 16),
  period: 'month',
  description: '',
})

const isSubmitting = ref(false)
const error = ref('')

const periods: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'half-year', label: '半年' },
  { value: 'year', label: '年' },
]

async function handleSubmit() {
  if (!form.name.trim()) {
    error.value = '请输入名称'
    return
  }
  
  error.value = ''
  isSubmitting.value = true
  
  try {
    await records.createSimpleRecord({
      ...form,
      description: form.description || undefined
    })
    emit('submit')
    resetForm()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '创建失败'
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.time = new Date().toISOString().slice(0, 16)
  form.period = 'month'
  form.description = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
      {{ error }}
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        提醒名称
      </label>
      <input
        v-model="form.name"
        type="text"
        placeholder="例如：会员续费、生日提醒"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        提醒时间
      </label>
      <input
        v-model="form.time"
        type="datetime-local"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        重复周期
      </label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="period in periods"
          :key="period.value"
          type="button"
          @click="form.period = period.value"
          class="px-4 py-3 rounded-xl border-2 text-center font-medium transition-all"
          :class="form.period === period.value 
            ? 'border-blue-600 bg-blue-50 text-blue-600' 
            : 'border-gray-200 hover:border-gray-300 text-gray-700'"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        备注（可选）
      </label>
      <textarea
        v-model="form.description"
        placeholder="添加详细描述..."
        rows="3"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
      />
    </div>

    <div class="flex gap-3 pt-2">
      <button
        type="button"
        @click="resetForm"
        class="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        重置
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <svg v-if="isSubmitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSubmitting ? '创建中...' : '创建记录' }}
      </button>
    </div>
  </form>
</template>
