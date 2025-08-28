<template>
  <Button :padding="padding" v-bind="rest">
    <slot />
  </Button>
</template>

<script lang="ts" setup>
import Button, { type ButtonProps } from '@/components/UI/Button.vue'

const { padding = 'xs', ...rest } = defineProps<ButtonProps>()
</script>

<style lang="scss" scoped></style>
