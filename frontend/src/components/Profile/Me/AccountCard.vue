<template>
  <CardBase class="account">
    <Icon class="account__icon" :name="ICON[type]" size="45" />
    <div class="account__info">
      <div class="account__name">{{ name }}</div>
      <div class="account__service">{{ capitalizeFirstLetter(type) }}</div>
    </div>
    <IconButton class="account__btn" radius="lg" variant="purple"
      ><Icon size="16" name="profile-remove"
    /></IconButton>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Profile/CardBase.vue'
import Icon from '@/components/UI/Icon.vue'
import { capitalizeFirstLetter } from '@/utils/utils.ts'
import IconButton from '@/components/UI/IconButton.vue'

const ICON = {
  steam: 'transparent_steam',
}

defineProps<{
  type: 'steam'
  name: string
}>()
</script>

<style lang="scss" scoped>
.account {
  @include flex-container(row, center, normal);
  gap: 16px;
  padding: 16px;
  width: min-content;

  @include media(mobile) {
    width: 100%;
  }

  &__icon {
    border-radius: 50%;
    border: 1px solid $outline-15;
  }

  &__info {
    @include flex(column);
    gap: 4px;
  }

  &__name {
    font: $font-body-16;
    color: $gray-300;
  }

  &__service {
    color: $white;
    font: $font-h2-20;
  }

  &__btn {
    @include media(mobile) {
      margin-left: auto;
    }
  }
}
</style>
