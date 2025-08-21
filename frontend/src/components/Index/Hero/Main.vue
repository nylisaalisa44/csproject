<template>
  <div class="main">
    <picture class="main__poster">
      <source
        type="image/avif"
        media="(width < 1009px)"
        srcset="
          @/assets/images/hero/3d-mobile.avif,
          @/assets/images/hero/3d-mobile@2x.avif 2x
        "
      />
      <source
        type="image/webp"
        media="(width < 1009px)"
        srcset="
          @/assets/images/hero/3d-mobile.webp,
          @/assets/images/hero/3d-mobile@2x.webp 2x
        "
      />
      <source
        type="image/avif"
        media="(width < 1440px)"
        srcset="
          @/assets/images/hero/3d-tablet.avif,
          @/assets/images/hero/3d-tablet@2x.avif 2x
        "
      />
      <source
        type="image/webp"
        media="(width < 1440px)"
        srcset="
          @/assets/images/hero/3d-tablet.webp,
          @/assets/images/hero/3d-tablet@2x.webp 2x
        "
      />
      <source
        type="image/avif"
        srcset="
          @/assets/images/hero/3d-desktop.avif,
          @/assets/images/hero/3d-desktop@2x.avif 2x
        "
      />
      <source
        type="image/webp"
        srcset="
          @/assets/images/hero/3d-desktop.webp,
          @/assets/images/hero/3d-desktop@2x.webp 2x
        "
      />
      <img src="@/assets/images/hero/3d-desktop@2x.png" alt="Poster" />
    </picture>
    <div class="main__title">
      <div class="main__title-brand">StoneSkins</div>
      <div class="main__title-description">
        Лучший <span>маркетплейс</span><br />скинов CS2 (CS:GO)
      </div>
    </div>
    <Button
      class="main__btn"
      variant="purple"
      :preset="dt == 'desktop' ? 'lg' : 'md'"
      >Начать обмен</Button
    >
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/UI/Button.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'

const dt = useDeviceType()
</script>

<style lang="scss" scoped>
.main {
  @include flex-container(column, flex-start, space-between);
  padding: 36px;
  height: 100%;
  border-radius: 20px;
  border: 1px solid $outline-15;
  background: $gradient-black-and-purple;
  background-origin: border-box;
  position: relative;

  @include media(tablet) {
    border-radius: 15px;
    padding: 24px;
  }

  @include media(mobile) {
    padding: 16px;
    height: 560px;
  }

  &__poster {
    position: absolute;
    bottom: -4px;
    right: -1px;
    z-index: 4;

    @include media(mobile) {
      bottom: 25px;
    }
  }

  &__title {
    @include flex(column);
    gap: 10px;
    z-index: 3;
  }

  &__title-brand {
    font: $font-h2-24;
    background: $gradient-white;
    background-clip: text;
    color: transparent;
    width: fit-content;

    @include media(tablet) {
      font: $font-h2-20-m;
    }

    @include media(mobile) {
      font: $font-body-16;
    }
  }

  &__title-description {
    font: $font-h1-48;
    color: $white;

    @include media(tablet) {
      font: $font-h1-36;
    }

    @include media(mobile) {
      font: $font-h2-24;
    }

    span {
      background: $gradient-white-and-purple;
      background-clip: text;
      color: transparent;
    }
  }

  &__btn {
    z-index: 5;

    @include media(mobile) {
      width: 100%;
    }
  }
}
</style>
