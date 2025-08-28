<template>
  <div class="label">
    <div class="label__header">
      <div class="label__title">{{ title }}</div>
      <slot name="label-helper" />
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<style lang="scss" scoped>
.label {
  @include flex(column);
  gap: 8px;
  width: 100%;

  &__header {
    @include flex-container(row, center, normal);
    gap: 15px;

    @include media(mobile) {
      gap: 6px;
    }
  }

  &__title {
    font: $font-h2-24;
    color: $white;

    @include media(mobile) {
      font: $font-h2-20;
    }
  }
}
</style>
