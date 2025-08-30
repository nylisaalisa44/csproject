<template>
  <CardBase class="steam-guard">
    <div class="steam-guard__top">
      <div class="steam-guard__title">Steam guard</div>
      <Status status="inactive" />
    </div>
    <div class="steam-guard__bottom">
      Steam guard - это второй уровень безопасности вашей учётной записи Steam.
      Это предотвращает кражу ваших предметов мошенниками и необходимо для
      торговли.
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Profile/CardBase.vue'
import Status from '@/components/Profile/Security/Status.vue'
</script>

<style lang="scss" scoped>
.steam-guard {
  @include flex(column);
  padding: 16px 24px;
  gap: 10px;

  @include media(tablet) {
    padding: 16px;
  }

  &__top {
    @include flex-container(row, center, space-between);
  }

  &__title {
    font: $font-h1-32;
    color: $white;
  }

  &__bottom {
    color: $gray-300;
    font: $font-body-16;
    max-width: 708px;

    @include media(tablet) {
      max-width: max-content;
      font: $font-body-14;
    }
  }
}
</style>
