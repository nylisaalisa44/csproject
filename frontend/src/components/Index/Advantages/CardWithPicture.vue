<template>
  <CardBase class="card">
    <div class="card__text">
      <slot name="text" />
    </div>
    <picture class="card__picture">
      <slot name="picture" />
    </picture>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Index/Advantages/CardBase.vue'
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(column, center, flex-start);
  background: $gradient-black-and-purple;
  padding: 24px 18px;
  background-origin: border-box;
  height: 402px;
  position: relative;
  overflow: hidden;

  @include media(tablet) {
    height: 313px;
    padding: 24px 0;
  }

  @include media(mobile) {
    height: 343px;
  }

  &__text {
    font: $font-h1-32;
    background: $gradient-white;
    background-clip: text;
    text-align: center;

    @include media(tablet) {
      font: $font-h2-20-m;
    }

    @include media(mobile) {
      font: $font-h2-24;
    }
  }

  &__picture {
    position: absolute;
    bottom: -4px;
  }
}
</style>
