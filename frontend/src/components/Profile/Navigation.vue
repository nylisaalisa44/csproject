<template>
  <div class="navigation">
    <RouterLink
      class="navigation__link"
      activeClass="active"
      v-for="(btn, idx) in NAVIGATION"
      :key="idx"
      :to="btn.path"
    >
      <Icon class="navigation__link-icon" size="24" :name="btn.icon" />
      <div class="navigation__link-text">
        {{ btn.title }}
      </div></RouterLink
    >
  </div>
</template>
link
<script lang="ts" setup>
import Icon from '@/components/UI/Icon.vue'

const NAVIGATION = [
  {
    title: 'Личный кабинет',
    icon: 'user-octagon',
    path: '/profile/me',
  },
  {
    title: 'Реферальная программа',
    icon: 'diagram',
    path: '/profile/referral',
  },
  {
    title: 'Транзакции',
    icon: 'empty-wallet',
    path: '/profile/transactions',
  },
  {
    title: 'Безопасность',
    icon: 'shield-tick',
    path: '/profile/security',
  },
]
</script>

<style lang="scss" scoped>
.navigation {
  @include flex(column);
  min-width: 310px;
  gap: 16px;

  @include media(tablet) {
    min-width: 260px;
  }

  @include media(mobile) {
    width: 100%;
  }

  &__link {
    @include flex-container(row, center, normal);
    gap: 16px;
    text-decoration: none;
    color: $white;
    padding: 0 16px 0 16px;
    transition:
      border-radius $transition-base,
      padding $transition-base,
      background-color $transition-base,
      box-shadow $transition-base;

    &.active {
      border-radius: 20px;
      padding: 16px;
      background-color: $purple;
      box-shadow: $shadow-menu;
    }
  }

  &__link-text {
    color: $white;
    font: $font-body-16;
  }
}
</style>
