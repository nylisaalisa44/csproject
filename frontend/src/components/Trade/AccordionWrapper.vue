<template>
  <Collapsible.Root :defaultOpen="open">
    <Collapsible.Trigger class="accordion" :class="{ inverse: inverse }">
      <div class="accordion__control" :class="{ inverse: inverse }">
        <Collapsible.Indicator
          ><Icon class="accordion__control-icon" name="arrow-down"
        /></Collapsible.Indicator>
        <div class="accordion__title">{{ title }}</div>
      </div>
      <div class="accordion__price">{{ price }}</div>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <slot />
    </Collapsible.Content>
  </Collapsible.Root>
</template>

<script lang="ts" setup>
import { Collapsible } from '@ark-ui/vue'
import Icon from '@/components/UI/Icon.vue'

defineProps<{
  title: string
  price: string
  inverse?: boolean
  open?: boolean
}>()
</script>

<style lang="scss" scoped>
@keyframes slideDown {
  from {
    opacity: 0.01;
    height: 0;
  }
  to {
    opacity: 1;
    height: var(--height);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    height: var(--height);
  }
  to {
    opacity: 0.01;
    height: 0;
  }
}

[data-scope='collapsible'][data-part='content'] {
  margin-top: 16px;
  overflow: hidden;

  @include media(tablet) {
    margin-top: 12px;
  }
}

[data-scope='collapsible'][data-part='content'][data-state='open'] {
  animation: slideDown 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
}

[data-scope='collapsible'][data-part='content'][data-state='closed'] {
  animation: slideUp 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
}

.accordion {
  @include flex-container(row, center, space-between);
  width: 100%;
  background-color: $gray-900;
  border: 1px solid $outline-15;
  border-radius: 20px;
  outline: none;
  padding: 12px 24px;

  &.inverse {
    flex-direction: row-reverse;
  }

  @include media(tablet) {
    padding: 12px 16px;
    border-radius: 15px;
  }

  &__control {
    @include flex-container(row, center, normal);
    gap: 12px;

    &.inverse {
      flex-direction: row-reverse;
    }
  }

  &__title {
    color: $white;
    font: $font-body-16;
  }

  [data-scope='collapsible'][data-part='indicator'] {
    @include flex-container(column, center, center);
    transition: transform $transition-base;
  }

  [data-scope='collapsible'][data-part='indicator'][data-state='open'] {
    transform: rotate(180deg);
  }

  &__control-icon {
    color: $gray-300;
  }

  &__price {
    color: $white;
    font: $font-body-16;
  }
}
</style>
