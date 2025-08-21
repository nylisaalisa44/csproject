<template>
  <CardBase class="card">
    <div class="card__text">
      <div class="card__text-large">{{ largeText }}</div>
      <div class="card__text-small">{{ smallText }}</div>
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Index/Advantages/CardBase.vue'

defineProps<{
  largeText: string
  smallText: string
}>()
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(column, flex-start, flex-end);
  background-color: $gray-900;
  padding: 24px;
  height: 175px;

  @include media(tablet) {
    padding: 16px;
    height: 135px;
  }

  @include media(mobile) {
    padding: 24px 16px;
  }

  &__text {
    @include flex(column);
    gap: 12px;
  }

  &__text-large {
    font: $font-h1-48;
    color: $white;

    @include media(tablet) {
      font: $font-h1-36;
    }

    @include media(mobile) {
      font: $font-h1-48;
    }
  }

  &__text-small {
    font: $font-h2-24;
    color: $gray-300;

    @include media(tablet) {
      font: $font-body-16;
    }

    @include media(mobile) {
      font: $font-h2-24;
    }
  }
}
</style>
