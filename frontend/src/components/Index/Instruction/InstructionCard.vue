<template>
  <div class="card">
    <component class="card__step" :is="step" />
    <div class="card__content">
      <div class="card__title">{{ title }}</div>
      <div class="card__description">{{ description }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'

defineProps<{
  step: Component
  title: string
  description: string
}>()
</script>

<style lang="scss" scoped>
.card {
  @include flex(column);
  gap: 32px;

  @include media(mobile) {
    gap: 16px;
  }

  &__content {
    @include flex(column);
    gap: 16px;

    @include media(mobile) {
      gap: 8px;
    }
  }

  &__step {
    height: 63px;

    @include media(tablet) {
      height: 42px;
    }

    @include media(mobile) {
      height: 47px;
    }
  }

  &__title {
    font: $font-h2-24;
    color: $white;

    @include media(tablet) {
      font: $font-h2-20-m;
    }

    @include media(mobile) {
      font: $font-h2-20;
    }
  }

  &__description {
    font: $font-body-16;
    color: $gray-300;
    max-width: 350px;

    @include media(tablet) {
      font: $font-body-14;
      max-width: 280px;
    }

    @include media(mobile) {
      font: $font-body-16;
      max-width: max-content;
    }
  }
}
</style>
