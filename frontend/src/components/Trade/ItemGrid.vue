<template>
  <div class="items" :class="{ empty: isEmpty }">
    <div class="items__title" v-if="isEmpty">
      <div class="items__title-large">{{ title }}</div>
      <div class="items__title-small">{{ subtitle }}</div>
    </div>
    <Item v-else v-for="(item, idx) in items" :key="item.id" :item="item" />
  </div>
</template>

<script lang="ts" setup>
import Item, { type ItemObject } from '@/components/UI/Item.vue'
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle: string
  items?: ItemObject[]
}>()
const items = computed<ItemObject[]>(() => {
  if (props.items) return props.items

  return []
})
const isEmpty = computed(() => items.value.length === 0)
</script>

<style lang="scss" scoped>
.items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;

  @include media(tablet) {
    grid-template-columns: repeat(3, 1fr);
  }

  @include media(mobile) {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  }

  &.empty {
    @include flex-container(column, center, flex-start);
    background: $gray-900;
    border: 1px solid $outline-15;
    border-radius: 20px;
    padding: 24px;
    padding-bottom: 72px;

    @include media(tablet) {
      border-radius: 15px;
      padding-bottom: 42px;
    }

    @include media(mobile) {
      padding-bottom: 72px;
    }
  }

  &__title {
    @include flex-container(column, center, flex-start);
    gap: 8px;
  }

  &__title-large {
    font: $font-h2-24;
    color: $white;

    @include media(tablet) {
      font: $font-h2-20-m;
    }
  }

  &__title-small {
    font: $font-h2-20;
    color: $gray-300;

    @include media(tablet) {
      font: $font-body-16;
    }

    @include media(mobile) {
      font: $font-body-14;
    }
  }
}
</style>
