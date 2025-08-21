import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/Index.vue'
import Trade from '@/pages/Trade.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
    },
    {
      path: '/trade',
      name: 'trade',
      component: Trade,
    },
  ],
})

export default router
