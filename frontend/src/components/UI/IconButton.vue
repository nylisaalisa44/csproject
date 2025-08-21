<template>
  <Button :variant="variant" padding="xs">
    <slot />
  </Button>
</template>

<script lang="ts" setup>
import Button, { type ButtonVariant } from '@/components/UI/Button.vue'

defineProps<{
  variant?: ButtonVariant
}>()
</script>

<style lang="scss" scoped></style>
