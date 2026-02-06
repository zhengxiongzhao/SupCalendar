<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SimpleRecordForm from '@/components/forms/SimpleRecordForm.vue'
import PaymentRecordForm from '@/components/forms/PaymentRecordForm.vue'

const router = useRouter()
const activeTab = ref<'simple' | 'payment'>('payment')

function onSuccess() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="max-w-2xl mx-auto animate-in">
    <div class="flex items-center gap-4 mb-6">
      <button 
        @click="goBack"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">新建记录</h1>
    </div>
    
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'payment'"
          class="flex-1 py-4 text-center font-medium transition-colors relative"
          :class="activeTab === 'payment' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            收付款
          </span>
          <div 
            v-if="activeTab === 'payment'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          />
        </button>
        <button
          @click="activeTab = 'simple'"
          class="flex-1 py-4 text-center font-medium transition-colors relative"
          :class="activeTab === 'simple' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            简单提醒
          </span>
          <div 
            v-if="activeTab === 'simple'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          />
        </button>
      </div>
      
      <div class="p-6">
        <SimpleRecordForm
          v-if="activeTab === 'simple'"
          @submit="onSuccess"
        />
        <PaymentRecordForm
          v-else
          @submit="onSuccess"
        />
      </div>
    </div>
  </div>
</template>
