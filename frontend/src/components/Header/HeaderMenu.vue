<template>
  <div class="menu">
    <div class="container menu__wrapper">
      <Button variant="purple">Войти через Steam</Button>
      <div class="menu__buttons">
        <div class="menu__buttons-inline">
          <Button>ru</Button>
          <Button>$ USD</Button>
          <Button grow>Поддержка</Button>
        </div>
        <Button>Продажа / обмен</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/UI/Button.vue'
</script>

<style lang="scss" scoped>
.menu {
  width: 100%;

  &__wrapper {
    @include flex(column);
    gap: 16px;
    padding-bottom: 30px;

    @include media(mobile) {
      padding-bottom: 16px;
    }
  }

  &__buttons {
    @include flex(column);
    gap: 6px;
  }

  &__buttons-inline {
    @include flex(row);
    gap: 6px;
  }
}
</style>
