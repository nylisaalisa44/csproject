<template>
  <div class="browser">
    <div class="browser__name">{{ browser }}</div>
    <div class="browser__os">
      {{ formattedOs }}
      <span v-if="thisDevice">Это устройство</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const { os, thisDevice } = defineProps<{
  browser: string
  os: string
  thisDevice?: boolean
}>()

const formattedOs = computed(() => {
  if (!thisDevice) return os

  return `${os} -`
})
</script>

<style lang="scss" scoped>
.browser {
  @include flex(column);
  gap: 4px;

  &__name {
    color: $white;
    font: $font-body-16;
  }

  &__os {
    color: $gray-300;
    font: $font-body-12;

    span {
      color: $green;
    }
  }
}
</style>
