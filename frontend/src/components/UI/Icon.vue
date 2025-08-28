<template>
  <component class="icon" :class="classObject" :is="icon" />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, shallowRef, watch } from 'vue'

const SIZE = {
  '16': 'size-16',
  '20': 'size-20',
  '24': 'size-24',
  '32': 'size-32',
  '45': 'size-45',
}

const { name, size = '24' } = defineProps<{
  name: string
  size?: keyof typeof SIZE
}>()
const icon = shallowRef()

watch(
  () => name,
  (name) => {
    icon.value = defineAsyncComponent(
      () => import(`@/assets/images/icons/${name}.svg`)
    )
  },
  { immediate: true }
)

const classObject = computed(() => [SIZE[size]])
</script>

<style lang="scss" scoped>
.icon {
  &.size-16 {
    width: 16px;
    height: 16px;
  }

  &.size-20 {
    width: 20px;
    height: 20px;
  }

  &.size-24 {
    width: 24px;
    height: 24px;
  }

  &.size-32 {
    width: 32px;
    height: 32px;
  }

  &.size-45 {
    width: 45px;
    height: 45px;
  }
}
</style>
