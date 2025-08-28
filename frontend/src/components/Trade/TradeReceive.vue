<template>
  <div class="receive">
    <AccordionWrapper
      open
      title="Вы получаете"
      price="$ 0.00"
      :inverse="dt != 'mobile'"
    >
      <ItemGrid
        title="Вы получаете"
        subtitle="Добавьте предметы"
        :items="TEST_ITEMS"
      />
    </AccordionWrapper>
    <FilterBar options-trigger :inverse="dt != 'mobile'" />
    <ItemGrid
      title="Упс, что то пошло нет так"
      subtitle="Наш инвентарь никогда не пуст ¯\_(ツ)_/¯"
      :items="TEST_ITEMS"
    />
  </div>
</template>

<script lang="ts" setup>
import ItemGrid from '@/components/Trade/ItemGrid.vue'
import AccordionWrapper from '@/components/Trade/AccordionWrapper.vue'
import FilterBar from '@/components/Trade/FilterBar.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'

const TEST_ITEMS = [
  {
    id: 0,
    imageUrl: '/test-item.webp',
    price: '1337 $',
    description: 'Description',
    tradeban: true,
    tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
  {
    id: 1,
    imageUrl: '/test-item-2.webp',
    price: '125.00 $',
    description: 'ST™  Fade FN',
    tradeban: false,
    tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
  {
    id: 2,
    imageUrl: '/test-item.webp',
    price: '1337 $',
    description: 'Description',
    tradeban: true,
    tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
  {
    id: 3,
    imageUrl: '/test-item-2.webp',
    price: '125.00 $',
    description: 'ST™  Fade FN',
    tradeban: false,
    tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
  {
    id: 4,
    imageUrl: '/test-item.webp',
    price: '1337 $',
    description: 'Description',
    tradeban: true,
    tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
  {
    id: 5,
    imageUrl: '/test-item-2.webp',
    price: '125.00 $',
    description: 'ST™  Fade FN',
    tradeban: false,
    tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
]
const dt = useDeviceType()
</script>

<style lang="scss" scoped>
.receive {
  @include flex(column);
  gap: 16px;
  padding: 16px 0 16px 0;

  @include media(tablet) {
    gap: 12px;
  }
}
</style>
