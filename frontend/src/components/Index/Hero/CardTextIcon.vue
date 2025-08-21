<template>
  <CardBase class="card">
    <div class="card__title">
      <slot />
    </div>
    <component class="card__icon" :is="icon" />
  </CardBase>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import CardBase from '@/components/Index/Hero/CardBase.vue'

defineProps<{
  icon: Component
}>()
</script>

<style lang="scss" scoped>
.card {
  padding: 24px 17px;
  background: $gradient-black;
  position: relative;
  height: 219px;

  @include media(tablet) {
    padding: 12px;
    height: 155px;
  }

  @include media(mobile) {
    padding: 16px;
    height: 165px;
  }

  &__title {
    font: $font-h2-20;
    font-size: 19px;
    color: $white;

    @include media(tablet) {
      font: $font-body-14;
    }
  }

  &__icon {
    position: absolute;
    right: 0;
    bottom: 0;

    @include media(tablet) {
      width: 135px;
      height: 135px;
    }
  }
}
</style>
