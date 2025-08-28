<template>
  <CardBase class="statistics">
    <div class="statistics__bar" v-for="(value, text) in VALUE" :key="text">
      <div class="statistics__bar-title">{{ text }}</div>
      <div class="statistics__bar-value">{{ value }}</div>
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Profile/CardBase.vue'

export type Statistics = {
  totalRegistrations: number
  totalTradingVolume: string
  totalDeals: number
  totalRevenue: string
  holdAmount: string
  totalWithdrawal: string
}
const props = defineProps<{
  statistics: Statistics
}>()

const VALUE = {
  'Количество регистраций': props.statistics.totalRegistrations,
  'Общий объем торгов': props.statistics.totalTradingVolume,
  'Количество сделок': props.statistics.totalDeals,
  'Общий доход ': props.statistics.totalRevenue,
  'Сумма в холде': props.statistics.holdAmount,
  Выведено: props.statistics.totalWithdrawal,
}
</script>

<style lang="scss" scoped>
.statistics {
  @include flex(column);
  padding: 16px;
  gap: 16px;
  flex-grow: 1;

  @include media(mobile) {
    gap: 6px;
  }

  &__bar {
    @include flex-container(row, center, space-between);
  }

  &__bar:not(:last-child) {
    border-bottom: 1px solid $gray-300;
    padding-bottom: 16px;

    @include media(mobile) {
      padding-bottom: 6px;
    }
  }

  &__bar-title {
    color: $gray-300;
    font: $font-h2-20;

    @include media(mobile) {
      font: $font-body-14;
    }
  }

  &__bar-value {
    color: $white;
    font: $font-h2-20;

    @include media(mobile) {
      font: $font-body-16;
    }
  }
}
</style>
