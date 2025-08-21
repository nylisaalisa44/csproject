<template>
  <div class="hub">
    <div class="hub__title">
      <div class="hub__title-small">
        Как покупать и продавать скины CS2, плюсы платформы и советы по обмену
      </div>
      <div class="hub__title-large">Начните с StoneSkins</div>
    </div>
    <div class="hub__wrapper">
      <Card v-for="(card, idx) in HUB" :key="idx" :url="card.url">{{
        card.title
      }}</Card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Card from '@/components/Index/Hub/Card.vue'

type Card = {
  title: string
  url: string
}
const HUB: Card[] = [
  {
    url: '#',
    title: 'Всё о покупке скинов — просто и безопасно',
  },
  {
    url: '#',
    title: 'Как быстро продать скин в CS2',
  },
  {
    url: '#',
    title: 'Обмен скинов CS2 за пару кликов',
  },
  {
    url: '#',
    title: 'Платформа, которой доверяют игроки',
  },
]
</script>

<style lang="scss" scoped>
.hub {
  @include flex-container(column, center, flex-start);
  gap: 24px;
  padding: 86px 0;

  @include media(tablet) {
    padding: 64px 0;
  }

  @include media(mobile) {
    padding: 32px 0;
  }

  &__wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @include media(mobile) {
      grid-template-columns: 1fr;
    }
  }

  &__title {
    @include flex-container(column, center, flex-start);
    gap: 8px;

    @include media(mobile) {
      gap: 4px;
    }
  }

  &__title-small {
    color: $gray-300;
    font: $font-h2-20;
    text-align: center;

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
