<template>
  <div v-if="dt != 'mobile'" class="container trade">
    <TradeGive />
    <TradeFilters />
    <TradeReceive />
  </div>
  <div class="container trade-mobile" v-else>
    <div class="trade-mobile__select">
      <Button
        :variant="tab == 'inventory' ? 'purple' : 'dark'"
        preset="sm"
        @click="tab = 'inventory'"
        grow
        >Инвентарь</Button
      >
      <Button
        :variant="tab == 'shop' ? 'purple' : 'dark'"
        @click="tab = 'shop'"
        preset="sm"
        grow
        >Покупка</Button
      >
    </div>
    <Button class="trade-mobile__submit" preset="sm" variant="purple"
      >Обменять предметы</Button
    >
    <TradeGive v-show="tab == 'inventory'" />
    <TradeReceive v-show="tab == 'shop'" />
    <TradeFilters v-show="filters.isOpened" class="trade-mobile__filters" />
  </div>
</template>

<script lang="ts" setup>
import TradeGive from '@/components/Trade/TradeGive.vue'
import TradeFilters from '@/components/Trade/TradeFilters.vue'
import TradeReceive from '@/components/Trade/TradeReceive.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'
import { ref } from 'vue'
import Button from '@/components/UI/Button.vue'
import { useFiltersStore } from '@/stores/filters.ts'

const dt = useDeviceType()
const tab = ref<'inventory' | 'shop'>('shop')
const filters = useFiltersStore()
</script>

<style lang="scss" scoped>
.trade {
  display: grid;
  grid-template-columns: 1fr 310px 1fr;

  @include media(tablet) {
    grid-template-columns: 1fr 264px 1fr;
  }
}

.trade-mobile {
  @include flex(column);
  padding: 16px 0 16px 0;
  position: relative;

  &__submit {
    margin-top: 16px;
  }

  &__filters {
    --header-height: 80px;
    width: 100%;
    height: calc(100dvh - var(--header-height));
    overflow: scroll;
    position: fixed;
    top: var(--header-height);
    left: 0;
    background-color: $black;
    z-index: $z-index-filters;
  }

  &__select {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
}
</style>
