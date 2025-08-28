<script lang="ts" setup>
import '@/assets/scss/main.scss'
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
import { useFiltersStore } from '@/stores/filters.ts'
import { watch } from 'vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'

const filters = useFiltersStore()
const dt = useDeviceType()

watch(
  () => [filters.isOpened, dt.value],
  () => {
    if (dt.value != 'mobile') {
      filters.close()
    }

    if (filters.isOpened) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<template>
  <Header />
  <main>
    <RouterView />
  </main>
  <Footer />
</template>

<style lang="scss" scoped></style>
