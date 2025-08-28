<template>
  <CardBase class="card">
    <Tooltip.Root
      :positioning="{
        placement: 'top',
        offset: {
          crossAxis: '-200',
        },
      }"
      v-model:open="tooltipOpened"
    >
      <Tooltip.Trigger @click="tooltipOpened = true" class="card__tooltip">
        <Icon name="info-circle" />
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content
          >Деньги падают на счёт в<br />момент снятия холда (7
          дней)</Tooltip.Content
        >
      </Tooltip.Positioner>
    </Tooltip.Root>
    <div class="card__chart">
      <div class="card__title">
        <div class="card__title-sum">{{ unitSum }} $</div>
        <div class="card__title-description">Доходы</div>
      </div>
      <svg width="200" height="200">
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke-width="5"
          fill="transparent"
          stroke="#6D748628"
          ref="background-circle"
        />
        <circle
          v-for="item in circles"
          cx="100"
          cy="100"
          r="88"
          stroke-width="24"
          fill="transparent"
          :stroke="item.color"
          stroke-linecap="round"
          :stroke-dasharray="[item.length, item.gap].join(' ')"
          :stroke-dashoffset="item.offset"
        />
      </svg>
    </div>
    <div class="card__legend">
      <div class="card__legend-item" v-for="(c, idx) in circles">
        <div
          class="card__legend-dot"
          :style="{ backgroundColor: c.color }"
        ></div>
        <div class="card__legend-title">{{ titles[idx] }}</div>
      </div>
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Profile/CardBase.vue'
import { computed, ref, useTemplateRef } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import { Tooltip } from '@ark-ui/vue/tooltip'

const props = defineProps<{
  values: number[]
  colors: string[]
  titles: string[]
}>()
const backgroundCircle = useTemplateRef('background-circle')
const arcLength = computed(() => {
  const c = backgroundCircle.value
  if (!c) return
  return c.getTotalLength()
})
const unitSum = props.values.reduce((a, b) => a + b, 0)
type Circle = {
  length: number
  gap: number
  color: string
  offset: number
}
const circles = computed(() => {
  const c: Circle[] = []
  const lengthPerUnit = arcLength.value / unitSum
  let offset = 0

  for (let i = 0; i < props.values.length; i++) {
    const length = lengthPerUnit * props.values[i]
    const gap = arcLength.value - length

    c.push({
      length: length,
      gap: gap,
      color: props.colors[i],
      offset: offset,
    })

    offset += gap
  }

  return c
})
const tooltipOpened = ref(false)
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(column, center, normal);
  width: 283px;
  padding: 16px 32px;

  @include media(mobile) {
    width: 100%;
    padding: 16px;
  }

  [data-scope='tooltip'][data-part='trigger'] {
    color: $gray-300;
    cursor: pointer;
    align-self: flex-end;
    background: none;
    outline: none;
    border: none;
    @include flex-container(column, center, center);
  }

  [data-scope='tooltip'][data-part='content'] {
    background: $gradient-purple;
    color: $white;
    font: $font-body-16;
    padding: 12px 24px;
    border-radius: 25px 25px 0px 25px;
  }

  [data-scope='tooltip'][data-part='content'][data-state='open'] {
    animation: fadeIn $transition-base;
  }

  [data-scope='tooltip'][data-part='content'][data-state='closed'] {
    animation: fadeOut $transition-base;
  }

  &__legend {
    @include flex-container(row, center, space-between);
    width: 219px;
    margin-top: auto;
    margin-bottom: 16px;

    @include media(mobile) {
      margin-top: 32px;
    }
  }

  &__legend-item {
    @include flex-container(row, center, center);
    gap: 10px;
  }

  &__legend-title {
    font: $font-body-16;
    color: $white;
  }

  &__legend-dot {
    width: 15px;
    height: 15px;
    border-radius: 50%;
  }

  &__chart {
    position: relative;
  }

  &__title {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    @include flex-container(column, center, center);
    gap: 6px;
    width: 100%;
  }

  &__title-sum {
    color: $white;
    font: $font-h1-48;
    text-align: center;

    @include media(mobile) {
      font: $font-h1-32;
    }
  }

  &__title-description {
    color: $gray-300;
    font: $font-body-16;
    text-align: center;

    @include media(mobile) {
      font: $font-body-14;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
}
</style>
