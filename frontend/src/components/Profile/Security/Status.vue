<template>
  <div class="status" :class="[status]">
    <Icon :name="ICON[status]" />
    <div class="status__text">{{ TEXT[status] }}</div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/UI/Icon.vue'

type Status = 'active' | 'inactive'

const ICON: Record<Status, string> = {
  active: 'tick-circle',
  inactive: 'close-circle',
}

const TEXT: Record<Status, string> = {
  active: 'Активный',
  inactive: 'Неактинвый',
}

defineProps<{
  status: Status
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
    font: $font-body-14;

    @include media(tablet) {
      display: none;
    }
  }

  &.active {
    background-color: $green;
    color: $secondary-green;
  }

  &.inactive {
    background-color: $red;
    color: $secondary-red;
  }
}
</style>
