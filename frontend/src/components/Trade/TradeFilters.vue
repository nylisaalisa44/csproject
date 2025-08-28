<template>
  <div class="filters">
    <FilterCollapsible title="Цена">
      <div class="filters__price">
        <div class="filters__price-fields">
          <Field
            name="priceMin"
            :text="priceFieldsTextSize"
            padding="lg"
            variant="gray"
            center-text
          />
          <Field
            name="priceMax"
            :text="priceFieldsTextSize"
            padding="lg"
            variant="gray"
            center-text
          />
        </div>
        <Switch>Доступная цена</Switch>
      </div>
    </FilterCollapsible>
    <FilterCollapsible title="Блокировка обмена" variant="filled">
      <Slider :min="0" :max="7" />
    </FilterCollapsible>
    <FilterCollapsible title="Оформление" />
    <FilterCollapsible title="Тип" />
    <FilterCollapsible title="Другое" />
    <FilterCollapsible title="Цвет" />
    <FilterCollapsible title="Износ" />
    <FilterCollapsible title="Градиент" />
    <FilterCollapsible title="Фаза" />
    <FilterCollapsible title="Редкость" />
    <FilterCollapsible title="Коллекция" />
    <Switch>StatTrack™</Switch>
    <div class="filters__buttons">
      <Button
        @click="filters.close()"
        v-if="dt == 'mobile'"
        preset="sm"
        variant="purple"
        >Закрыть / Применить</Button
      >
      <Button v-else preset="sm" variant="purple">Обменять предметы</Button>
      <Button preset="sm" variant="dark">Сбросить фильтры</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FilterCollapsible from '@/components/Trade/FilterCollapsible.vue'
import Field from '@/components/UI/Field.vue'
import Switch from '@/components/UI/Switch.vue'
import Slider from '@/components/UI/Slider.vue'
import Button from '@/components/UI/Button.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'
import { computed } from 'vue'
import { useFiltersStore } from '@/stores/filters.ts'

const dt = useDeviceType()
const priceFieldsTextSize = computed(() =>
  dt.value == 'desktop' ? 'lg' : 'md-2'
)
const filters = useFiltersStore()
</script>

<style lang="scss" scoped>
.filters {
  @include flex(column);
  gap: 16px;
  padding: 16px;

  @include media(tablet) {
    gap: 12px;
    padding: 12px;
  }

  @include media(mobile) {
    padding: 16px;
  }

  &__price {
    @include flex(column);
    gap: 16px;

    @include media(tablet) {
      gap: 12px;
    }
  }

  &__price-fields {
    @include flex(row);
    gap: 6px;
    margin-top: 16px;

    @include media(tablet) {
      margin-top: 12px;
    }
  }

  &__buttons {
    @include flex(column);
    gap: 8px;
  }
}
</style>
