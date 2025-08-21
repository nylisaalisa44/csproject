<template>
  <div class="container">
    <ItemGrid />
    <Item v-for="(item, idx) in TEST_ITEMS" :key="idx" :item="item" />
  </div>
</template>

<script lang="ts" setup>
import ItemGrid from '@/components/Trade/ItemGrid.vue'
import Item, { type ItemObject } from '@/components/UI/Item.vue'

const TEST_ITEMS: ItemObject[] = [
  {
    imageUrl: '@/assets/images/test-item.webp',
    price: '1337 $',
    description: 'Description',
    tradeban: true,
    // tradebanExpires: new Date().setDate(new Date().getDate() + 5),
  },
]
</script>
