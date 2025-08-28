<template>
  <div class="give">
    <AccordionWrapper open title="Вы отдаёте" price="$ 0.00">
      <ItemGrid
        title="Вы отдаёте"
        subtitle="Добавьте предметы"
        :items="TEST_ITEMS"
      />
    </AccordionWrapper>
    <FilterBar />
    <ItemGrid title="Ваш инвентарь пуст" subtitle="Добавьте предметы" />
  </div>
</template>

<script lang="ts" setup>
import ItemGrid from '@/components/Trade/ItemGrid.vue'
import AccordionWrapper from '@/components/Trade/AccordionWrapper.vue'
import FilterBar from '@/components/Trade/FilterBar.vue'

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
    imageUrl: '/test-item-2.webp',
    price: '125.00 $',
    description: 'ST™  Fade FN',
    tradeban: false,
    tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
]
</script>

<style lang="scss" scoped>
.give {
  @include flex(column);
  gap: 16px;
  padding: 16px 0 16px 0;

  @include media(tablet) {
    gap: 12px;
  }
}
</style>
