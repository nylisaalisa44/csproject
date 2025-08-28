<template>
  <Collapsible.Root :class="classObject">
    <Collapsible.Trigger>
      {{ title }}
      <Collapsible.Indicator>
        <Icon name="arrow-down" />
      </Collapsible.Indicator>
    </Collapsible.Trigger>
    <Collapsible.Content><slot /></Collapsible.Content>
  </Collapsible.Root>
</template>

<script lang="ts" setup>
import { Collapsible } from '@ark-ui/vue/collapsible'
import Icon from '@/components/UI/Icon.vue'
import { computed } from 'vue'

const VARIANT = {
  filled: 'variant-filled',
  default: 'variant-default',
}
export type FilterCollapsibleVariant = keyof typeof VARIANT

const { title, variant = 'default' } = defineProps<{
  title: string
  variant?: FilterCollapsibleVariant
}>()

const classObject = computed(() => [VARIANT[variant]])
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

[data-scope='collapsible'][data-part='root'] {
  transition:
    padding $transition-base,
    background-color $transition-base;

  &.variant-filled[data-state='open'] {
    background-color: $gray-900;
    border-radius: 15px;
    border: 1px solid $outline-15;
    padding: 12px 24px;
  }

  &.variant-filled [data-scope='collapsible'][data-part='content'] {
    padding-top: 8px;
  }
}

[data-scope='collapsible'][data-part='trigger'] {
  @include flex-container(row, center, space-between);
  background: none;
  outline: none;
  border: none;
  color: $white;
  font: $font-body-16;
  width: 100%;
  cursor: pointer;
}

[data-scope='collapsible'][data-part='indicator'] {
  @include flex-container(column, center, center);
  color: $gray-300;
  transition: transform $transition-base;
}

[data-scope='collapsible'][data-part='indicator'][data-state='open'] {
  transform: rotate(180deg);
}

[data-scope='collapsible'][data-part='content'] {
  overflow: hidden;
}

[data-scope='collapsible'][data-part='content'][data-state='open'] {
  animation: slideDown 250ms cubic-bezier(0, 0, 0.38, 0.9);
}

[data-scope='collapsible'][data-part='content'][data-state='closed'] {
  animation: slideUp 200ms cubic-bezier(0, 0, 0.38, 0.9);
}
</style>
