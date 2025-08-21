<template>
  <CardBase class="card">
    <div class="card__title">Простой и быстрый вывод средств</div>
    <picture class="card__poster">
      <source
        type="image/avif"
        media="(width < 1009px)"
        srcset="
          @/assets/images/hero/withdrawal-mobile.avif,
          @/assets/images/hero/withdrawal-mobile@2x.avif 2x
        "
      />
      <source
        type="image/webp"
        media="(width < 1009px)"
        srcset="
          @/assets/images/hero/withdrawal-mobile.webp,
          @/assets/images/hero/withdrawal-mobile@2x.webp 2x
        "
      />
      <source
        type="image/avif"
        media="(width < 1440px)"
        srcset="
          @/assets/images/hero/withdrawal-tablet.avif,
          @/assets/images/hero/withdrawal-tablet@2x.avif 2x
        "
      />
      <source
        type="image/webp"
        media="(width < 1440px)"
        srcset="
          @/assets/images/hero/withdrawal-tablet.webp,
          @/assets/images/hero/withdrawal-tablet@2x.webp 2x
        "
      />
      <source
        type="image/avif"
        srcset="
          @/assets/images/hero/withdrawal-desktop.avif,
          @/assets/images/hero/withdrawal-desktop@2x.avif 2x
        "
      />
      <source
        type="image/webp"
        srcset="
          @/assets/images/hero/withdrawal-desktop.webp,
          @/assets/images/hero/withdrawal-desktop@2x.webp 2x
        "
      />
      <img
        src="@/assets/images/hero/withdrawal-desktop@2x.png"
        alt="Withdrawal"
      />
    </picture>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Index/Hero/CardBase.vue'
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(column, center, flex-start);
  padding: 18px 0;
  background-color: $gray-900;
  height: 329px;
  position: relative;

  @include media(tablet) {
    height: 265px;
  }

  @include media(mobile) {
    height: 343px;
  }

  &__poster {
    position: absolute;
    bottom: -4px;
  }

  &__title {
    font: $font-h1-32;
    background: $gradient-white;
    background-clip: text;
    text-align: center;
    text-wrap: balance;

    @include media(tablet) {
      font: $font-h2-24;
    }
  }
}
</style>
