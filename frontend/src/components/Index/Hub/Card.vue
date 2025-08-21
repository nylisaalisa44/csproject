<template>
  <div class="card">
    <div class="card__wrapper">
      <div class="card__title">
        <slot />
      </div>
      <Button
        variant="transparent"
        :preset="BUTTON_PRESET[dt]"
        class="card__btn"
      >
        <Icon class="card__btn-icon" name="arrow-right" />
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button, { type ButtonPreset } from '@/components/UI/Button.vue'
import Icon from '@/components/UI/Icon.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'

const dt = useDeviceType()
const BUTTON_PRESET: Record<string, ButtonPreset> = {
  desktop: 'lg',
  tablet: 'lg',
  mobile: 'sm',
}

defineProps<{
  url: string
}>()
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(column, normal, flex-end);
  padding: 32px;
  border: 1px solid $outline-15;
  border-radius: 20px;
  height: 300px;
  background-origin: border-box;

  @include media(tablet) {
    padding: 24px;
    height: 204px;
    border-radius: 15px;
  }

  @include media(mobile) {
    padding: 16px;
    height: 160px;
  }

  &:nth-child(1) {
    background: url('@/assets/images/hub/bg-card-1.webp') center / cover
      no-repeat;
  }

  &:nth-child(2) {
    background: url('@/assets/images/hub/bg-card-2.webp') center / cover
      no-repeat;
  }

  &:nth-child(3) {
    background: url('@/assets/images/hub/bg-card-3.webp') center / cover
      no-repeat;
  }

  &:nth-child(4) {
    background: url('@/assets/images/hub/bg-card-4.webp') center / cover
      no-repeat;
  }

  &__wrapper {
    @include flex-container(row, flex-end, space-between);
    gap: 32px;

    @include media(mobile) {
      gap: 24px;
    }
  }

  &__title {
    color: $white;
    font: $font-h1-36;

    @include media(tablet) {
      font: $font-h2-24;
    }

    @include media(mobile) {
      font: $font-h2-20;
    }
  }
}
</style>
