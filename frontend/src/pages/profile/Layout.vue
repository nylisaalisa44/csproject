<template>
  <div class="profile container">
    <Navigation class="profile__navigation" />
    <RouterView />
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'
import Navigation from '@/components/Profile/Navigation.vue'

const route = useRoute()
const router = useRouter()

watch(
  () => route.name,
  (routeName) => {
    if (!routeName) return
    if (routeName === 'profile') {
      router.push('/profile/me')
      console.log('Redirected to /profile/me due to this is layout page')
    }
  },
  {
    immediate: true,
  }
)
</script>

<style lang="scss" scoped>
.profile {
  @include flex(row);
  gap: 16px;
  padding: 16px 0 16px 0;

  &__navigation {
    @include media(mobile) {
      display: none;
    }
  }
}
</style>
