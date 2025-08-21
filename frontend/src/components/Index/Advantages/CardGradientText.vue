<template>
  <CardBase class="card">
    <div class="card__text">
      <slot />
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Index/Advantages/CardBase.vue'
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(column, flex-start, flex-end);
  background: $gradient-black-and-purple;
  padding: 24px;
  height: 196px;
  background-origin: border-box;

  @include media(tablet) {
    height: 151px;
  }

  @include media(mobile) {
    height: fit-content;
    padding: 24px 16px;
  }

  &__text {
    background: $gradient-white;
    background-clip: text;
    font: $font-h1-32;

    @include media(tablet) {
      font: $font-h2-24;
    }
  }
}
</style>
