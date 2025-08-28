<template>
  <CardBase class="user">
    <img class="user__avatar" :src="user.avatarUrl" alt="Avatar" />
    <div class="user__info">
      <div class="user__sid-wrapper">
        <div class="user__sid">{{ user.steamId }}</div>
        <Icon @click="copySid" class="user__sid-copy" size="20" name="copy" />
      </div>
      <div class="user__name">
        {{ user.name }}
      </div>
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import Icon from '@/components/UI/Icon.vue'
import CardBase from '@/components/Profile/CardBase.vue'

export type User = {
  name: string
  steamId: string
  avatarUrl: string
}
const props = defineProps<{
  user: User
}>()

const copySid = async () => {
  await navigator.clipboard.writeText(props.user.steamId)
}
</script>

<style lang="scss" scoped>
.user {
  @include flex-container(row, center, normal);
  padding: 16px;
  gap: 32px;

  @include media(tablet) {
    padding: 23px 16px;
    gap: 24px;
  }

  @include media(mobile) {
    padding: 16px;
    gap: 12px;
  }

  &__avatar {
    width: 104px;
    height: 104px;
    background-size: cover;
    background-position: top center;
    border-radius: 50%;

    @include media(tablet) {
      width: 60px;
      height: 60px;
    }

    @include media(mobile) {
      width: 62px;
      height: 62px;
    }
  }

  &__info {
    @include flex(column);
    gap: 4px;
  }

  &__sid-wrapper {
    @include flex-container(row, center, norma);
    gap: 6px;
    color: $gray-300;
  }

  &__sid {
    font: $font-body-16;

    @include media(tablet) {
      font: $font-body-14;
    }

    @include media(mobile) {
      font: $font-body-16;
    }
  }

  &__sid-copy {
    cursor: pointer;
  }

  &__name {
    color: $white;
    font: $font-h1-32;

    @include media(tablet) {
      font: $font-h2-24;
    }
  }
}
</style>
