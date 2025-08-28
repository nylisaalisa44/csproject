import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/Index.vue'
import Trade from '@/pages/Trade.vue'
import ProfileLayout from '@/pages/profile/Layout.vue'
import ProfileMe from '@/pages/profile/Me.vue'
import ProfileReferral from '@/pages/profile/Referral.vue'

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
    {
      path: '/profile',
      name: 'profile',
      component: ProfileLayout,
      children: [
        {
          path: 'me',
          name: 'me',
          component: ProfileMe,
        },
        {
          path: 'referral',
          name: 'referral',
          component: ProfileReferral,
        },
      ],
    },
  ],
})

export default router
