<template>
  <div class="card">
    <div class="card__author">
      <img class="card__avatar" :src="avatarUrl" alt="Avatar" />
      <div class="card__author-wrapper">
        <div class="card__name">{{ name }}</div>
        <div class="card__time">{{ publishTime }}</div>
      </div>
    </div>
    <div class="card__text">
      {{ text }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  avatarUrl: string
  name: string
  publishTime: string // TODO: make timestamp parse
  text: string
}>()
</script>

<style lang="scss" scoped>
.card {
  @include flex(column);
  gap: 48px;
  border-radius: 20px;
  background-color: $black;
  padding: 24px;
  border: 1px solid $outline-15;
  height: 100%;

  @include media(tablet) {
    padding: 18px;
    gap: 36px;
    border-radius: 15px;
  }

  @include media(mobile) {
    padding: 16px;
    gap: 16px;
  }

  &__author {
    @include flex-container(row, center);
    gap: 12px;

    @include media(tablet) {
      gap: 9px;
    }

    @include media(mobile) {
      gap: 12px;
    }
  }

  &__author-wrapper {
    @include flex(column);
    gap: 12px;

    @include media(tablet) {
      gap: 9px;
    }

    @include media(mobile) {
      gap: 6px;
    }
  }

  &__avatar {
    width: 64px;
    height: 64px;
    background-size: cover;
    background-position: top center;
    border-radius: 50%;

    @include media(tablet) {
      width: 48px;
      height: 48px;
    }

    @include media(mobile) {
      width: 50px;
      height: 50px;
    }
  }

  &__name {
    font: $font-h2-24;
    color: $white;

    @include media(tablet) {
      font-weight: 500;
      font-size: 18px;
    }

    @include media(mobile) {
      font: $font-h2-20;
    }
  }

  &__time {
    font: $font-h2-20;
    color: $gray-300;

    @include media(tablet) {
      font-weight: 400;
      font-size: 15px;
    }

    @include media(mobile) {
      font: $font-body-16;
    }
  }

  &__text {
    font: $font-h2-20;
    color: $white;

    @include media(tablet) {
      font-weight: 400;
      font-size: 15px;
    }

    @include media(mobile) {
      font: $font-body-14;
    }
  }
}
</style>
