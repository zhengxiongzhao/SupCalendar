<script setup lang="ts">
import { useRoute } from 'vue-router'
import MobileNav from './components/layout/MobileNav.vue'
import DesktopNav from './components/layout/DesktopNav.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <DesktopNav />
    
    <main class="md:pl-64 pb-20 md:pb-0">
      <div class="max-w-7xl mx-auto p-4 md:p-8">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <Component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </div>
    </main>
    
    <MobileNav />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
