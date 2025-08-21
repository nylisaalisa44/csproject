<template>
  <CardBase class="trust">
    <Button
      :text="dt == 'desktop' || dt == 'mobile' ? 'md' : 'sm'"
      :padding="dt == 'desktop' ? 'md' : 'md-2'"
      variant="transparent"
      >Нам доверяют 145 457 пользователей</Button
    >
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Index/Hero/CardBase.vue'
import Button from '@/components/UI/Button.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'

const dt = useDeviceType()
</script>

<style lang="scss" scoped>
.trust {
  @include flex-container(column, center, center);
  padding: 24px 0;
  background:
    $gradient-uniform-purple,
    url('@/assets/images/hero/trust-bg.jpg') center/cover no-repeat;
  background-blend-mode: color, normal;
  background-origin: border-box;

  @include media(mobile) {
    padding: 16px;
    align-items: stretch;
  }
}
</style>
