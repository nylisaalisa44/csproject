<template>
  <header class="header" :class="{ 'menu-open': menu.isOpened }">
    <div class="container header__wrapper">
      <div class="header__buttons">
        <Button>Продажа / обмен</Button>
        <Button>Поддержка</Button>
      </div>
      <router-link to="/"><Logo class="header__logo" /></router-link>
      <div class="header__buttons">
        <Button>ru</Button>
        <Button>$ USD</Button>
        <Button variant="purple">Войти через Steam</Button>
      </div>
      <IconButton
        @click="menu.toggle()"
        :variant="menu.isOpened ? 'invisible' : 'dark'"
        class="header__menubtn"
      >
        <Icon
          :name="menu.isOpened ? 'x' : 'menu'"
          :size="menu.isOpened ? '16' : '24'"
          :class="menu.isOpened ? 'gray' : 'white'"
        />
      </IconButton>
    </div>
    <HeaderMenu v-if="menu.isOpened" />
  </header>
  <div class="header-spacer"></div>
</template>

<script lang="ts" setup>
import Logo from '@/assets/images/logo.svg'
import Button from '@/components/UI/Button.vue'
import IconButton from '@/components/UI/IconButton.vue'
import HeaderMenu from '@/components/Header/HeaderMenu.vue'
import { useMenuStore } from '@/stores/menu.ts'
import Icon from '@/components/UI/Icon.vue'

const menu = useMenuStore()
</script>

<style lang="scss" scoped>
$headerHeight: 80px;

.header-spacer {
  height: $headerHeight;
}

.header {
  border-bottom: 1px solid $gray-900;
  position: fixed;
  width: 100%;
  top: 0;
  background-color: $black;
  z-index: $z-index-header;

  &.menu-open {
    box-shadow: $shadow-menu;
    border-radius: 0 0 15px 15px;
  }

  &__wrapper {
    @include flex-container(row, center, space-between);
    height: $headerHeight;
  }

  &__buttons {
    @include flex(row);
    gap: 6px;
    flex-grow: 1;
    flex-basis: 0;

    @include media(mobile) {
      display: none;
    }
  }

  &__buttons:last-of-type {
    justify-content: flex-end;
  }

  &__logo {
    color: $white;
  }

  &__menubtn {
    display: none;

    @include media(mobile) {
      display: flex;
    }
  }
}

.white {
  color: $white;
}

.gray {
  color: $gray-300;
}
</style>
