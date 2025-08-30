<template>
  <div class="trade">
    <img class="trade__trader" :src="trade.traderImage" alt="Avatar" />
    <Icon name="refresh-2" />
    <div class="trade__item">
      <img :src="trade.itemImage" alt="Item" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/UI/Icon.vue'

export type Trade = {
  traderImage: string
  itemImage: string
}
defineProps<{
  trade: Trade
}>()
</script>

<style lang="scss" scoped>
.trade {
  @include flex-container(row, center, center);
  gap: 6px;
  color: $gray-300;

  &__trader {
    width: 50px;
    height: 50px;
    background-size: cover;
    background-position: top center;
    border-radius: 50%;
  }

  &__item {
    @include flex-container(column, center, center);
    width: 50px;
    height: 50px;
    border-radius: 10px;
    border: 1px solid $outline-15;
    padding: 8px;

    img {
      width: 100%;
    }
  }
}
</style>
