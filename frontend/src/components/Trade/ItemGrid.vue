<template>
  <div class="items empty">
    <div class="items__title">
      <div class="items__title-large">Вы отдаёте</div>
      <div class="items__title-small">Добавьте предметы</div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.items {
  &.empty {
    @include flex-container(column, center, flex-start);
    background: $gray-900;
    border: 1px solid $outline-15;
    border-radius: 20px;
    padding: 24px;
    padding-bottom: 72px;

    @include media(tablet) {
      border-radius: 15px;
      padding-bottom: 42px;
    }

    @include media(mobile) {
      padding-bottom: 72px;
    }
  }

  &__title {
    @include flex-container(column, center, flex-start);
    gap: 8px;
  }

  &__title-large {
    font: $font-h2-24;
    color: $white;

    @include media(tablet) {
      font: $font-h2-20-m;
    }
  }

  &__title-small {
    font: $font-h2-20;
    color: $gray-300;

    @include media(tablet) {
      font: $font-body-16;
    }

    @include media(mobile) {
      font: $font-body-14;
    }
  }
}
</style>
