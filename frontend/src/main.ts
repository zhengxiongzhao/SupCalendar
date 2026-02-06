import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('./views/Dashboard.vue')
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('./views/CalendarView.vue')
    },
    {
      path: '/create',
      name: 'Create',
      component: () => import('./views/CreateRecord.vue')
    },
    {
      path: '/records',
      name: 'Records',
      component: () => import('./views/RecordsList.vue')
    }
  ]
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
