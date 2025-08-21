<template>
  <div class="reviews">
    <div class="reviews__wrapper">
      <div class="reviews__title">
        <div class="reviews__title-small">
          Лучшие условия для торговли скинами CS2
        </div>
        <div class="reviews__title-large">Отзывы</div>
      </div>
      <div class="embla" ref="emblaRef">
        <div class="embla__container">
          <div
            class="embla__slide"
            v-for="(review, idx) in REVIEWS"
            :key="idx"
            :index="idx"
          >
            <ReviewCard
              :text="review.text"
              :avatar-url="review.avatarUrl"
              :name="review.name"
              :publish-time="review.publishTime"
            />
          </div>
        </div>
        <div class="embla__dots">
          <button
            v-for="(_, idx) in scrollSnaps"
            :key="idx"
            @click="() => onDotButtonClick(idx)"
            class="embla__btn"
            :class="{ selected: idx === selectedIndex }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ReviewCard from '@/components/Index/Reviews/ReviewCard.vue'
import emblaCarouselVue from 'embla-carousel-vue'
import { useDotButton } from '@/composables/useDotButton.ts'

type Review = {
  avatarUrl: string
  name: string
  publishTime: string
  text: string
}
const REVIEWS: Review[] = [
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=1',
    name: 'Pavel',
    publishTime: '1 день назад',
    text: 'Удобный интерфейс, моментальные сделки. Всё прозрачно и быстро!',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=2',
    name: 'Anna',
    publishTime: '2 дня назад',
    text: 'Отличный сервис! Быстрая поддержка и удобное оформление заказов.',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=3',
    name: 'Dmitry',
    publishTime: '3 дня назад',
    text: 'Понятная платформа, всё работает как часы. Рекомендую!',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=4',
    name: 'Elena',
    publishTime: '4 дня назад',
    text: 'Сделки проходят гладко, интерфейс интуитивный. Очень довольна!',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=5',
    name: 'Sergey',
    publishTime: '5 дней назад',
    text: 'Надёжный сервис, никаких скрытых комиссий. Всё честно.',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=6',
    name: 'Marina',
    publishTime: '1 неделю назад',
    text: 'Удобно и просто, даже для новичков. Поддержка на высоте!',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=7',
    name: 'Alexey',
    publishTime: '2 недели назад',
    text: 'Быстро, удобно, безопасно. Пользуюсь регулярно и всем доволен.',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=8',
    name: 'Olga',
    publishTime: '3 недели назад',
    text: 'Интерфейс супер, всё понятно с первого раза. Отличная работа!',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=9',
    name: 'Ivan',
    publishTime: '1 месяц назад',
    text: 'Скорость обработки впечатляет, всё на уровне. Рекомендую всем!',
  },
  {
    avatarUrl: 'https://i.pravatar.cc/300?u=10',
    name: 'Boban',
    publishTime: '3 месяца назад',
    text: 'Всё гуд!',
  },
]
const [emblaRef, emblaApi] = emblaCarouselVue({
  loop: true,
})
const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)
</script>

<style lang="scss" scoped>
.reviews {
  background-color: $gray-900;
  border-radius: 75px;
  border: 1px solid $outline-15;
  padding: 86px 0;

  @include media(tablet) {
    padding: 64px 0;
    border-radius: 50px;
  }

  @include media(mobile) {
    padding: 32px 0;
    border-radius: 35px;
  }

  &__wrapper {
    @include flex-container(column, center, flex-start);
    gap: 24px;

    @include media(mobile) {
      padding: 0 16px;
    }
  }

  &__title {
    @include flex-container(column, center, center);
    gap: 8px;
  }

  &__title-small {
    font: $font-h2-20;
    color: $gray-300;

    @include media(mobile) {
      font: $font-body-12;
    }
  }

  &__title-large {
    background: $gradient-white;
    background-clip: text;
    font: $font-h1-64;

    @include media(mobile) {
      font: $font-h1-36;
    }
  }

  .embla {
    overflow: hidden;
    width: 100%;

    --slide-spacing: 12px;

    @include media(tablet) {
      --slide-spacing: 9px;
    }

    @include media(mobile) {
      --slide-spacing: 12px;
    }
  }

  .embla__container {
    @include flex(row);
    touch-action: pan-y pinch-zoom;
    margin-left: calc(var(--slide-spacing) * -1);
  }

  .embla__slide {
    transform: translate3d(0, 0, 0);
    flex: 0 0 30%;
    min-width: 0;
    padding-left: var(--slide-spacing);

    @include media(mobile) {
      flex: 0 0 100%;
    }
  }

  .embla__dots {
    @include flex-container(row, center, center);
    gap: 6px;
    margin-top: 24px;
  }

  .embla__btn {
    width: 12px;
    height: 12px;
    border: none;
    outline: none;
    background-color: $black;
    border-radius: 50px;
    transition:
      width $transition-base,
      background-color $transition-base;

    &.selected {
      background-color: $white;
      width: 24px;
    }
  }
}
</style>
