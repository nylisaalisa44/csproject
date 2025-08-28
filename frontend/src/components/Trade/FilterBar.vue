<template>
  <div class="bar" :class="{ inverse: inverse }">
    <IconButton
      v-show="!searchVisible && dt != 'desktop'"
      class="bar__search-trigger"
      variant="dark"
      @click="searchVisible = true"
    >
      <Icon size="16" name="search-normal" />
    </IconButton>
    <IconButton class="bar__update" variant="invisible">
      <Icon name="rotate-right" />
    </IconButton>
    <IconButton
      @click="filters.open()"
      v-if="optionsTrigger"
      class="bar__options"
      variant="invisible"
    >
      <Icon name="options" />
    </IconButton>
    <Field
      v-show="searchVisible"
      class="bar__search"
      name="search"
      placeholder="Поиск"
    >
      <template v-slot:right>
        <Icon
          :name="dt == 'desktop' ? 'search-normal' : 'x'"
          @click="closeSearch"
        />
      </template>
    </Field>
    <Select
      class="bar__price-filter"
      hint="Цена:"
      icon="textalign-right"
      :items="PRICE_FILTER"
      :default-value="['desc']"
    />
  </div>
</template>

<script lang="ts" setup>
import Field from '@/components/UI/Field.vue'
import Icon from '@/components/UI/Icon.vue'
import Select from '@/components/UI/Select.vue'
import IconButton from '@/components/UI/IconButton.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'
import { ref, watch } from 'vue'
import { useFiltersStore } from '@/stores/filters.ts'

const PRICE_FILTER = [
  {
    label: 'Макс',
    value: 'desc',
  },
  {
    label: 'Мин',
    value: 'asc',
  },
]
defineProps<{
  inverse?: boolean
  optionsTrigger?: boolean
}>()
const dt = useDeviceType()
const searchVisible = ref<boolean>(true)
const filters = useFiltersStore()

watch(
  () => dt.value,
  () => {
    if (dt.value == 'desktop') {
      searchVisible.value = true
    } else {
      searchVisible.value = false
    }
  },
  { immediate: true }
)

const closeSearch = () => {
  if (dt.value != 'desktop') {
    searchVisible.value = false
  }
}
</script>

<style lang="scss" scoped>
.bar {
  @include flex-container(row, center, space-between);
  padding: 12px 24px;
  border-radius: 20px;
  border: 1px solid $outline-15;
  background-color: $gray-900;

  @include media(tablet) {
    border-radius: 15px;
    padding: 12px 16px;
  }

  &__options {
    display: none;

    @include media(mobile) {
      display: flex;
    }
  }

  &__search-trigger {
    display: none;

    @include media(tablet) {
      display: flex;
    }
  }

  &.inverse {
    flex-direction: row-reverse;
  }
}
</style>
