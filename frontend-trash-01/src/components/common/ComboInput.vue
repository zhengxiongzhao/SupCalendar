<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: string
  options: string[]
  placeholder?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入或选择',
  label: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)

const filteredOptions = computed(() => {
  if (!props.modelValue) return props.options
  return props.options.filter(opt => 
    opt.toLowerCase().includes(props.modelValue.toLowerCase())
  )
})

const showDropdown = computed(() => 
  isOpen.value && filteredOptions.value.length > 0
)

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  isOpen.value = true
}

function selectOption(option: string) {
  emit('update:modelValue', option)
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative">
    <div class="relative">
        <input
          :value="modelValue"
        @input="handleInput"
        @focus="isOpen = true"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-10"
      />
      <button
        type="button"
        @click="toggleDropdown"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg 
          class="w-5 h-5 transition-transform duration-200" 
          :class="{ 'rotate-180': isOpen }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div
        v-if="showDropdown"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
      >
        <div
          v-if="filteredOptions.length === 0"
          class="px-4 py-3 text-gray-500 text-sm"
        >
          按回车使用 "{{ modelValue }}"
        </div>
        <button
          v-for="option in filteredOptions"
          :key="option"
          type="button"
          @click="selectOption(option)"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm"
          :class="{ 'bg-blue-50 text-blue-600': option === modelValue }"
        >
          {{ option }}
        </button>
      </div>
    </Transition>
  </div>
</template>
