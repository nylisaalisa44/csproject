<template>
  <CardBase class="card">
    <div class="card__text">
      <slot />
    </div>
    <Button variant="transparent" padding="lg" radius="lg" class="card__btn">
      <Icon class="card__btn-icon" name="arrow-right" />
    </Button>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Index/Advantages/CardBase.vue'
import Button from '@/components/UI/Button.vue'
import Icon from '@/components/UI/Icon.vue'
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(row, center, space-between);
  padding: 0 24px;
  height: 196px;
  background: url('@/assets/images/advantages/trade-bg.webp') center / cover
    no-repeat;

  @include media(tablet) {
    height: 151px;
    gap: 11px;
  }

  &__btn-icon {
    color: $white;
  }

  &__text {
    font: $font-h1-32;
    background: $gradient-white;
    background-clip: text;

    @include media(tablet) {
      font: $font-h2-24;
    }
  }
}
</style>
