<template>
  <Select.Root :defaultValue="defaultValue" :collection="collection">
    <Select.Control>
      <Select.Trigger>
        <div class="select__selected-text">
          <Icon class="select__icon" v-if="icon" :name="icon" />
          {{ hint }}
          <Select.ValueText />
          <Select.Indicator>
            <Icon name="arrow-down" />
          </Select.Indicator>
        </div>
      </Select.Trigger>
    </Select.Control>
    <Teleport to="body">
      <Select.Positioner>
        <Select.Content>
          <Select.ItemGroup>
            <Select.Item
              v-for="item in collection.items"
              :key="item.value"
              :item="item"
            >
              <Select.ItemText>{{ item.label }}</Select.ItemText>
            </Select.Item>
          </Select.ItemGroup>
        </Select.Content>
      </Select.Positioner>
    </Teleport>
    <Select.HiddenSelect />
  </Select.Root>
</template>

<script lang="ts" setup>
import { createListCollection, Select } from '@ark-ui/vue/select'
import Icon from '@/components/UI/Icon.vue'

export type SelectItem = {
  label: string
  value: string
}
const { items } = defineProps<{
  items: SelectItem[]
  defaultValue?: string[]
  hint?: string
  icon?: string
}>()
const collection = createListCollection({ items: items })
</script>

<style lang="scss" scoped>
[data-scope='select'][data-part='trigger'] {
  @include flex-container(row, center, center);
  background-color: transparent;
  border: none;
  outline: none;
  color: $white;
  font: $font-body-16;
  cursor: pointer;
}

[data-scope='select'][data-part='indicator'] {
  @include flex-container(column, center, center);
  color: $gray-300;
  transition: transform $transition-base;
}

[data-scope='select'][data-part='indicator'][data-state='open'] {
  transform: rotate(180deg);
}

[data-scope='select'][data-part='content'] {
  background-color: $black;
  box-shadow: 0px 0px 20px $purple;
  border: 1px solid $outline-15;
  border-radius: 15px;
}

[data-scope='select'][data-part='content'][data-state='open'] {
  animation: fadeIn 0.25s ease-out;
}

[data-scope='select'][data-part='content'][data-state='closed'] {
  animation: fadeOut 0.2s ease-in;
}

[data-scope='select'][data-part='item'] {
  cursor: pointer;
  color: $gray-300;
  font: $font-body-16;
}

[data-scope='select'][data-part='item']:first-child {
  padding: 24px 24px 4px 24px;
}

[data-scope='select'][data-part='item']:not(:first-child):not(:last-child) {
  padding: 4px 24px 4px 24px;
}

[data-scope='select'][data-part='item']:last-child {
  padding: 4px 24px 24px 24px;
}

[data-scope='select'][data-part='item'][data-state='checked'] {
  color: $white;
}

.select__selected-text {
  @include flex-container(row, center, center);
  gap: 6px;
}

.select__icon {
  color: $gray-300;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
