<template>
  <div class="item">
    <div class="item__content">
      <div v-show="item.tradeban" class="item__tradeban">
        <Icon class="item__tradeban-icon" name="lock-closed" />
        <div class="item__tradeban-text">0 дн</div>
      </div>
      <div class="item__info">
        <div class="item__description">{{ item.description }}</div>
        <div class="item__price">{{ item.price }}</div>
      </div>
    </div>
    <img class="item__image" :src="item.imageUrl" alt="Item" />
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/UI/Icon.vue'
import { computed } from 'vue'

export type ItemObject = {
  tradeban: boolean
  // tradebanExpires?: Date
  description: string
  price: string
  imageUrl: string
}
const props = defineProps<{
  item: ItemObject
}>()
// const tradebanDays = computed(() => {
//   if (!props.item.tradeban) return 0
//
//   const now = new Date()
//   const target = props.item.tradebanExpires
//   const diff = target.getTime() - now.getTime()
//   const oneDay = 1000 * 60 * 60 * 24
//   const daysRemaining = Math.ceil(diff / oneDay)
//   return daysRemaining
// })
</script>

<style lang="scss" scoped>
.item {
  background-color: $gray-900;
  border: 1px solid $outline-15;
  border-radius: 20px;
  padding: 8px;
  position: relative;
  width: 130px;
  height: 130px;

  &__content {
    @include flex-container(column, normal, space-between);
    height: 100%;
    z-index: 5;
    position: relative;
  }

  &__image {
    position: absolute;
    z-index: 1;
    width: 90%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__tradeban {
    @include flex-container(row, center, normal);
    gap: 6px;
  }

  &__tradeban-text {
    color: $gray-300;
    font: $font-body-12;
  }

  &__tradeban-icon {
    width: 16px;
    height: 16px;
    color: $gray-300;
  }

  &__info {
    @include flex(column);
    gap: 6px;
  }

  &__description {
    color: $gray-300;
    font: $font-body-12;
  }

  &__price {
    font: $font-body-16;
    color: $white;
  }
}
</style>
