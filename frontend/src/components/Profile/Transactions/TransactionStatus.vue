<template>
  <div class="status" :class="[status]">
    <Icon :name="ICON[status]" />
    <div class="status__text">{{ TEXT[status] }}</div>
  </div>
</template>

<script lang="ts" setup>
import type { IStatus } from '@/types/transaction.ts'
import Icon from '@/components/UI/Icon.vue'

const ICON: Record<IStatus, string> = {
  completed: 'tick-circle',
  failed: 'close-circle',
  suspended: 'pause-circle',
  pending: 'clock',
  other: 'info-circle',
}

const TEXT: Record<IStatus, string> = {
  completed: 'Завершено',
  failed: 'Неудалось',
  suspended: 'Приостановлено',
  pending: 'В процессе',
  other: 'Другое',
}

defineProps<{
  status: IStatus
}>()
</script>

<style lang="scss" scoped>
.status {
  @include flex-container(row, center, center);
  padding: 10px 24px;
  gap: 10px;
  border-radius: 25px;

  @include media(tablet) {
    padding: 10px;
    border-radius: 50%;
  }

  &__text {
    @include flex-container(row, center, center);
    font: $font-body-12;

    @include media(tablet) {
      display: none;
    }
  }

  &.completed {
    background-color: $green;
    color: $secondary-green;
  }

  &.failed {
    background-color: $red;
    color: $secondary-red;
  }

  &.suspended,
  &.pending,
  &.other {
    background-color: $yellow;
    color: $secondary-yellow;
  }
}
</style>
