<template>
  <button class="button" :class="classObject">
    <Icon v-if="iconLeft" :name="iconLeft" />
    <slot />
    <Icon v-if="iconRight" :name="iconRight" />
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Icon from '@/components/UI/Icon.vue'

// Here is a lot of options, so what if combine this options into presets, e.g `large` it's padding lg, radius lg, text lg?

const PADDING = {
  xs: 'padding-xs',
  sm: 'padding-sm',
  md: 'padding-md',
  'md-2': 'padding-md-2',
  lg: 'padding-lg',
}
export type ButtonPadding = keyof typeof PADDING

const VARIANT = {
  invisible: 'variant-invisible',
  transparent: 'variant-transparent',
  dark: 'variant-dark',
  purple: 'variant-purple',
}
export type ButtonVariant = keyof typeof VARIANT

const TEXT = {
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
}
export type ButtonText = keyof typeof TEXT

const RADIUS = {
  md: 'radius-md',
  lg: 'radius-lg',
}
export type ButtonRadius = keyof typeof RADIUS

type ClassObject = {
  padding: ButtonPadding
  text: ButtonText
  radius: ButtonRadius
}
const PRESET: Record<'sm' | 'md' | 'lg', ClassObject> = {
  sm: {
    padding: 'sm',
    radius: 'md',
    text: 'sm',
  },
  md: {
    padding: 'md',
    radius: 'md',
    text: 'md',
  },
  lg: {
    padding: 'lg',
    radius: 'lg',
    text: 'lg',
  },
}
export type ButtonPreset = keyof typeof PRESET

const {
  padding = 'sm',
  variant = 'dark',
  text = 'sm',
  radius = 'md',
  preset,
  grow = false,
} = defineProps<{
  grow?: boolean
  padding?: ButtonPadding
  variant?: ButtonVariant
  radius?: ButtonRadius
  text?: ButtonText
  preset?: ButtonPreset
  iconLeft?: string
  iconRight?: string
}>()

const classObject = computed(() => {
  const p = preset ? PRESET[preset].padding : padding
  const t = preset ? PRESET[preset].text : text
  const r = preset ? PRESET[preset].radius : radius

  return [
    PADDING[p],
    VARIANT[variant],
    TEXT[t],
    RADIUS[r],
    {
      grow: grow,
    },
  ]
})
</script>

<style lang="scss" scoped>
.button {
  @include flex-container(row, center, center);
  background: transparent;
  cursor: pointer;
  border: 1px transparent solid;
  transition:
    border $transition-base,
    background $transition-base,
    background-color $transition-base,
    box-shadow $transition-base;

  &.radius-md {
    border-radius: 25px;
  }

  &.radius-lg {
    border-radius: 50px;
  }

  &.padding-lg {
    padding: 20px 48px;
  }

  &.padding-md-2 {
    padding: 19px 16px;
  }

  &.padding-md {
    padding: 18px 32px;
  }

  &.padding-sm {
    padding: 12px 24px;
  }

  &.padding-xs {
    padding: 8px;
  }

  &.variant-transparent {
    color: $white;
    background-color: rgba($white, 0.05);
    border: 1px solid $outline-15;
  }

  &.variant-invisible {
    color: $white;
    background-color: transparent;
    border: none;
  }

  &.variant-dark {
    color: $white;
    background-color: $gray-900;
    border: 1px solid $outline-15;
  }

  &.variant-purple {
    color: $white;
    background-color: $purple;
  }

  &.grow {
    flex-grow: 1;
  }

  &.text-sm {
    font: $font-body-14;
  }

  &.text-md {
    font: $font-body-16;
  }

  &.text-lg {
    font: $font-h2-20;
  }

  &:hover {
    border: 1px solid $outline-15;
    background: $gradient-purple;
    box-shadow: $shadow-purple;
    background-origin: border-box;
  }
}
</style>
