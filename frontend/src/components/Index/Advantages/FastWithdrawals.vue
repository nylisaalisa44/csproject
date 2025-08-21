<template>
  <CardBase class="card">
    <div class="card__text">Самые быстрые<br />выплаты на рынке</div>
    <picture class="card__calendar">
      <source
        type="image/webp"
        media="(width < 1009px)"
        srcset="
          @/assets/images/advantages/calendar-mobile.webp,
          @/assets/images/advantages/calendar-mobile@2x.webp 2x
        "
      />
      <source
        type="image/webp"
        media="(width < 1440px)"
        srcset="
          @/assets/images/advantages/calendar-tablet.webp,
          @/assets/images/advantages/calendar-tablet@2x.webp 2x
        "
      />
      <source
        type="image/webp"
        srcset="
          @/assets/images/advantages/calendar-desktop.webp,
          @/assets/images/advantages/calendar-desktop@2x.webp 2x
        "
      />
      <img
        src="@/assets/images/advantages/calendar-desktop@2x.webp"
        alt="Calendar"
      />
    </picture>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Index/Advantages/CardBase.vue'
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(row, center, flex-start);
  background-color: $gray-900;
  padding: 24px;
  height: 175px;
  position: relative;
  overflow: hidden;

  @include media(tablet) {
    padding: 36px 8px;
    height: 135px;
  }

  @include media(mobile) {
    padding: 30px 16px;
    height: 107px;
  }

  &__text {
    font: $font-h1-32;
    background: $gradient-white;
    background-clip: text;

    @include media(tablet) {
      font: $font-h2-20;
    }

    @include media(mobile) {
      font: $font-h2-24;
    }
  }

  &__calendar {
    position: absolute;
    bottom: -4px;
    right: 0;
  }
}
</style>
