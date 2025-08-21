<template>
  <div class="advantages">
    <div class="advantages__title">
      <div class="advantages__title-small">
        Лучшие условия для торговли скинами CS2
      </div>
      <div class="advantages__title-large">Почему выбирают нас?</div>
    </div>
    <div class="advantages__wrapper">
      <div class="advantages__line-1">
        <FastWithdrawals class="cells-3" />
        <StatisticsCard
          class="cells-2"
          large-text="24/7"
          small-text="Поддержка в чате"
        />
        <StatisticsCard
          class="cells-2"
          large-text="1 млн."
          small-text="Успешных обменов"
        />
        <StatisticsCard
          class="cells-2"
          large-text="145k+"
          small-text="Пользователей"
        />
      </div>
      <div class="advantages__line-2">
        <CardWithPicture class="cell-1">
          <template v-slot:text>
            Обменивайте все<br />
            доступные скины из CS2
          </template>
          <template v-slot:picture>
            <source
              type="image/webp"
              media="(width < 1009px)"
              srcset="
                @/assets/images/advantages/weapon-mobile.webp,
                @/assets/images/advantages/weapon-mobile@2x.webp 2x
              "
            />
            <source
              type="image/webp"
              media="(width < 1440px)"
              srcset="
                @/assets/images/advantages/weapon-tablet.webp,
                @/assets/images/advantages/weapon-tablet@2x.webp 2x
              "
            />
            <source
              type="image/webp"
              srcset="
                @/assets/images/advantages/weapon-desktop.webp,
                @/assets/images/advantages/weapon-desktop@2x.webp 2x
              "
            />
            <img
              src="@/assets/images/advantages/weapon-desktop@2x.png"
              alt="Weapon"
            />
          </template>
        </CardWithPicture>
        <CardGradientText class="cell-2"
          >Редкие скины для<br />вашей коллекции</CardGradientText
        >
        <CardWithButton class="cell-3">Начать торговать</CardWithButton>
        <CardWithPicture class="cell-4">
          <template v-slot:text>
            Маркетплейс с<br />моментальной выплатой
          </template>
          <template v-slot:picture>
            <source
              type="image/webp"
              media="(width < 1009px)"
              srcset="
                @/assets/images/advantages/coins-mobile.webp,
                @/assets/images/advantages/coins-mobile@2x.webp 2x
              "
            />
            <source
              type="image/webp"
              media="(width < 1440px)"
              srcset="
                @/assets/images/advantages/coins-tablet.webp,
                @/assets/images/advantages/coins-tablet@2x.webp 2x
              "
            />
            <source
              type="image/webp"
              srcset="
                @/assets/images/advantages/coins-desktop.webp,
                @/assets/images/advantages/coins-desktop@2x.webp 2x
              "
            />
            <img
              src="@/assets/images/advantages/coins-desktop@2x.webp"
              alt="Weapon"
            />
          </template>
        </CardWithPicture>
      </div>
      <Button class="advantages__btn-mobile" preset="md" variant="purple"
        >Начать торговать</Button
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import StatisticsCard from '@/components/Index/Advantages/StatisticsCard.vue'
import FastWithdrawals from '@/components/Index/Advantages/FastWithdrawals.vue'
import CardWithPicture from '@/components/Index/Advantages/CardWithPicture.vue'
import CardGradientText from '@/components/Index/Advantages/CardGradientText.vue'
import CardWithButton from '@/components/Index/Advantages/CardWithButton.vue'
import Button from '@/components/UI/Button.vue'
</script>

<style lang="scss" scoped>
.advantages {
  @include flex(column);
  gap: 24px;
  padding: 86px 0;

  @include media(tablet) {
    padding: 64px 0;
  }

  @include media(mobile) {
    padding: 32px 0;
  }

  &__btn-mobile {
    display: none;

    @include media(mobile) {
      display: flex;
    }
  }

  &__wrapper {
    @include flex(column);
    gap: 12px;
  }

  &__line-1 {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 12px;

    @include media(mobile) {
      grid-template-columns: 1fr;
    }

    .cells-3 {
      grid-column: span 3 / span 3;

      @include media(mobile) {
        grid-column: auto;
      }
    }

    .cells-2 {
      grid-column: span 2 / span 2;

      @include media(mobile) {
        grid-column: auto;
      }
    }
  }

  &__line-2 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 12px;

    @include media(mobile) {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
    }

    .cell-1 {
      grid-column: 1 / 2;
      grid-row: 1 / 3;

      @include media(mobile) {
        grid-column: auto;
        grid-row: auto;
      }
    }

    .cell-2 {
      grid-column: 2 / 3;
      grid-row: 1 / 2;

      @include media(mobile) {
        grid-column: auto;
        grid-row: auto;
      }
    }

    .cell-3 {
      grid-column: 2 / 3;
      grid-row: 2 / 3;

      @include media(mobile) {
        grid-column: auto;
        grid-row: auto;

        display: none;
      }
    }

    .cell-4 {
      grid-column: 3 / 4;
      grid-row: 1 / 3;

      @include media(mobile) {
        grid-column: auto;
        grid-row: auto;
      }
    }
  }

  &__title {
    @include flex-container(column, center, center);
    gap: 8px;
  }

  &__title-small {
    color: $gray-300;
    font: $font-h2-20;

    @include media(mobile) {
      font: $font-body-12;
    }
  }

  &__title-large {
    background: $gradient-white;
    background-clip: text;
    font: $font-h1-64;

    @include media(mobile) {
      font: $font-h2-24;
    }
  }
}
</style>
