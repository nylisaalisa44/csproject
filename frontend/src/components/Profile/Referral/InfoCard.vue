<template>
  <CardBase class="info">
    <div class="info__header">
      <div class="info__title">{{ title }}</div>
      <Icon class="info__icon" :name="icon" />
    </div>
    <div class="info__description">{{ description }}</div>
  </CardBase>
</template>

<script lang="ts" setup>
import Icon from '@/components/UI/Icon.vue'
import CardBase from '@/components/Profile/CardBase.vue'

defineProps<{
  title: string
  description: string
  icon: string
}>()
</script>

<style lang="scss" scoped>
.info {
  @include flex-container(column, normal, space-between);
  padding: 16px;
  gap: 16px;

  @include media(tablet) {
    padding: 12px;
    gap: 12px;
  }

  @include media(mobile) {
    padding: 16px;
    gap: 16px;
  }

  &__header {
    @include flex-container(row, normal, space-between);
  }

  &__title {
    font: $font-h2-20;
    color: $white;
    max-width: 143px;
  }

  &__icon {
    color: $purple;
    width: 48px !important;
    height: 48px !important;

    @include media(tablet) {
      width: 36px !important;
      height: 36px !important;
    }

    @include media(mobile) {
      width: 48px !important;
      height: 48px !important;
    }
  }

  &__description {
    color: $gray-300;
    font: $font-body-16;

    @include media(tablet) {
      font: $font-body-14;
    }
  }
}
</style>
