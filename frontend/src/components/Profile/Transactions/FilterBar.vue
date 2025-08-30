<template>
  <CardBase class="bar">
    <div class="bar__title">Транзакции</div>
    <div class="bar__filters">
      <div class="bar__filters-select">
        <Select
          hint="Статус: "
          :items="STATUS_FILTER"
          :default-value="['all']"
        />
        <Select hint="Тип: " :items="TYPE_FILTER" :default-value="['all']" />
      </div>
      <IconButton
        v-show="!searchVisible && dt == 'mobile'"
        variant="dark"
        @click="searchVisible = true"
      >
        <Icon size="16" name="search-normal" />
      </IconButton>
      <Field
        v-show="searchVisible"
        class="bar__search"
        name="search"
        placeholder="Поиск"
      >
        <template v-slot:right>
          <Icon
            :name="dt != 'mobile' ? 'search-normal' : 'x'"
            @click="closeSearch"
          />
        </template>
      </Field>
    </div>
  </CardBase>
</template>

<script lang="ts" setup>
import CardBase from '@/components/Profile/CardBase.vue'
import Select from '@/components/UI/Select.vue'
import Icon from '@/components/UI/Icon.vue'
import Field from '@/components/UI/Field.vue'
import { ref, watch } from 'vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'
import IconButton from '@/components/UI/IconButton.vue'

const STATUS_FILTER = [
  {
    label: 'Все',
    value: 'all',
  },
  {
    label: 'Завершено',
    value: 'completed',
  },
  {
    label: 'Неудалось',
    value: 'failed',
  },
  {
    label: 'Приостановлено',
    value: 'suspended',
  },
  {
    label: 'В процессе',
    value: 'pending',
  },
  {
    label: 'Другое',
    value: 'other',
  },
]
const TYPE_FILTER = [
  {
    label: 'Все',
    value: 'all',
  },
  {
    label: 'Покупка',
    value: 'buy',
  },
  {
    label: 'Продажа',
    value: 'sell',
  },
  {
    label: 'Вывод',
    value: 'withdrawal',
  },
  {
    label: 'Пополнение',
    value: 'deposit',
  },
]
const searchVisible = ref(true)
const dt = useDeviceType()
const closeSearch = () => {
  if (dt.value != 'desktop') {
    searchVisible.value = false
  }
}

watch(
  () => dt.value,
  () => {
    if (dt.value != 'mobile') {
      searchVisible.value = true
    } else {
      searchVisible.value = false
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.bar {
  @include flex-container(row, center, space-between);
  padding: 12px 24px;

  @include media(mobile) {
    padding: 12px 16px;
  }

  &__title {
    font: $font-body-16;
    color: $white;

    @include media(mobile) {
      display: none;
    }
  }

  &__filters {
    @include flex-container(row, center, normal);
    gap: 24px;

    @include media(mobile) {
      width: 100%;
      justify-content: space-between;
    }
  }

  &__filters-select {
    @include flex-container(row, center, normal);
    gap: 24px;
  }
}
</style>
