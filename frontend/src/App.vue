<script lang="ts" setup>
import '@/assets/scss/main.scss'
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
</script>

<template>
  <Header />
  <main>
    <RouterView />
  </main>
  <Footer />
</template>

<style lang="scss" scoped></style>
