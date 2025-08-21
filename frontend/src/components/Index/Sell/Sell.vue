<template>
  <div class="sell">
    <div class="sell__content">
      <div class="sell__text">
        <div class="sell__title">Продавайте скины CS2</div>
        <div class="sell__description">
          Продавайте ваши предметы на нашей платформе и получайте мгновенную
          выплату
        </div>
      </div>
      <Button class="sell__btn" :preset="BUTTON_PRESET[dt]"
        >Продать сейчас</Button
      >
    </div>
    <picture class="sell__banner">
      <source
        type="image/webp"
        media="(width < 1009px)"
        srcset="
          @/assets/images/sell/sell-banner-mobile.webp,
          @/assets/images/sell/sell-banner-mobile@2x.webp 2x
        "
      />
      <source
        type="image/webp"
        media="(width < 1440px)"
        srcset="
          @/assets/images/sell/sell-banner-tablet.webp,
          @/assets/images/sell/sell-banner-tablet@2x.webp 2x
        "
      />
      <source
        type="image/webp"
        srcset="
          @/assets/images/sell/sell-banner-desktop.webp,
          @/assets/images/sell/sell-banner-desktop@2x.webp 2x
        "
      />
      <img src="@/assets/images/sell/sell-banner-desktop@2x.png" alt="Banner" />
    </picture>
  </div>
</template>

<script lang="ts" setup>
import Button, { type ButtonPreset } from '@/components/UI/Button.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'

const BUTTON_PRESET: Record<string, ButtonPreset> = {
  desktop: 'lg',
  tablet: 'sm',
  mobile: 'sm',
}
const dt = useDeviceType()
</script>

<style lang="scss" scoped>
.sell {
  background: $gradient-black;
  border: 1px solid $outline-15;
  padding: 48px 30px;
  position: relative;
  border-radius: 20px;
  height: 307px;
  margin: 86px 0;

  @include media(tablet) {
    margin: 64px 0;
  }

  @include media(mobile) {
    margin: 32px 0;
  }

  @include media(tablet) {
    padding: 32px 30px;
    height: 232px;
    border-radius: 15px;
  }

  @include media(mobile) {
    padding: 16px;
    height: 355px;
  }

  &__content {
    @include flex-container(column, flex-start, space-between);

    height: 100%;
  }

  &__text {
    @include flex(column);
    gap: 16px;

    @include media(mobile) {
      gap: 8px;
    }
  }

  &__title {
    font: $font-h1-48;
    background: $gradient-black;
    background-clip: text;

    @include media(tablet) {
      font: $font-h1-36;
    }

    @include media(mobile) {
      font: $font-h2-24;
    }
  }

  &__description {
    font: $font-h2-24;
    color: $gray-300;
    max-width: 600px;

    @include media(tablet) {
      font: $font-h2-20;
      max-width: 450px;
    }

    @include media(mobile) {
      font: $font-body-14;
    }
  }

  &__banner {
    position: absolute;
    top: 0;
    right: 0;

    @include media(mobile) {
      left: 25px;
      top: 72px;
      transform: scale(0.9);
    }
  }

  &__btn {
    @include media(mobile) {
      width: 100%;
    }
  }
}
</style>
