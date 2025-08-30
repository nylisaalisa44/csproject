<template>
  <CardBase class="card">
    <div class="card__title">{{ title }}</div>
    <div class="card__balance">
      <div class="card__balance-usd">{{ balance.usd }}</div>
      <div class="card__balance-btc">{{ balance.btc }}</div>
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Profile/CardBase.vue'

defineProps<{
  title: string
  balance: {
    usd: string
    btc: string
  }
}>()
</script>

<style lang="scss" scoped>
.card {
  @include flex-container(column, normal, space-between);
  padding: 16px;
  gap: 16px;

  &__title {
    color: $white;
    font: $font-h2-20;
  }

  &__balance {
    @include flex(column);
    gap: 8px;
  }

  &__balance-usd {
    font: $font-h2-20;
    color: $white;
  }

  &__balance-btc {
    font: $font-body-12;
    color: $gray-300;
  }
}
</style>
