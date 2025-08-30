<template>
  <CardBase class="delete">
    <div class="delete__top">
      <div class="delete__title">Удалить ваш аккаунт?</div>
      <Button class="delete__btn" preset="sm" variant="red"
        >Удалить учётную запись навсегда</Button
      >
    </div>
    <div class="delete__bottom">
      Ваш аккаунт и вся идентифицирующая информация будут удалены из нашего
      сервиса. Пожалуйста, убедитесь, что вы заранее сняли весь баланс со Stone
      Skins, так как позже его будет невозможно восстановить. В соответствии с
      правовыми нормами им обязаны хранить всю финансовую информации даже после
      того, как ваша учетная запись будет закрыта
    </div>
    <Button class="delete__btn-mobile" preset="sm" variant="red"
      >Удалить учётную запись навсегда</Button
    >
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Profile/CardBase.vue'
import Button from '@/components/UI/Button.vue'
</script>

<style lang="scss" scoped>
.delete {
  @include flex(column);
  padding: 16px 24px;
  gap: 24px;

  @include media(tablet) {
    padding: 16px;
    gap: 16px;
  }

  @include media(mobile) {
    gap: 8px;
  }

  &__top {
    @include flex-container(row, center, space-between);
  }

  &__title {
    color: $white;
    font: $font-h1-32;

    @include media(mobile) {
      font: $font-h2-20-m;
    }
  }

  &__bottom {
    font: $font-body-14;
    color: $gray-300;
    width: 664px;

    @include media(tablet) {
      width: 100%;
    }

    @include media(mobile) {
      font: $font-body-12;
    }
  }

  &__btn {
    @include media(mobile) {
      display: none;
    }
  }

  &__btn-mobile {
    display: none;

    @include media(mobile) {
      display: flex;
    }
  }
}
</style>
