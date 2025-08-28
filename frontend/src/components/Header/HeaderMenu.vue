<template>
  <div class="menu">
    <div class="container menu__wrapper">
      <Button v-if="!isLoggedIn" variant="purple">Войти через Steam</Button>
      <div v-else class="menu__logged">
        <div class="menu__user">
          <img
            class="menu__user-avatar"
            src="https://i.pravatar.cc/300"
            alt="Avatar"
          />
          <div class="menu__user-wrapper">
            <div class="menu__user-as">Вы вошли как</div>
            <div class="menu__user-name">boboie</div>
          </div>
        </div>
        <Navigation />
      </div>
      <div class="menu__buttons">
        <div class="menu__buttons-inline">
          <Button>ru</Button>
          <Button>$ USD</Button>
          <Button grow>Поддержка</Button>
        </div>
        <Button to="/trade">Продажа / обмен</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/UI/Button.vue'
import { ref } from 'vue'
import Navigation from '@/components/Profile/Navigation.vue'

const isLoggedIn = ref(true)
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

  &__logged {
    @include flex(column);
    gap: 24px;
    margin-bottom: 8px;
  }

  &__buttons {
    @include flex(column);
    gap: 6px;
  }

  &__buttons-inline {
    @include flex(row);
    gap: 6px;
  }

  &__user-avatar {
    width: 48px;
    height: 48px;
    background-size: cover;
    background-position: top center;
    border-radius: 50%;
  }

  &__user {
    @include flex-container(row, center, normal);
    gap: 10px;
  }

  &__user-wrapper {
    @include flex(column);
    gap: 6px;
  }

  &__user-as {
    font: $font-body-16;
    color: $gray-300;
  }

  &__user-name {
    font: $font-h2-24;
    color: $white;
  }
}
</style>
