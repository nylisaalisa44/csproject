<template>
  <label class="field" :class="classObject" :disabled="disabled">
    <slot name="left" />
    <input
      v-model="model"
      :disabled="disabled"
      :name="name"
      class="field__input"
      type="text"
      :placeholder="placeholder"
    />
    <slot name="right" />
  </label>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const VARIANT = {
  black: 'variant-black',
  gray: 'variant-gray',
}
export type FieldVariant = keyof typeof VARIANT

const PADDING = {
  md: 'padding-md',
  'md-2': 'padding-md-2',
  lg: 'padding-lg',
}
export type FieldPadding = keyof typeof PADDING

const TEXT = {
  md: 'text-md',
  'md-2': 'text-md-2',
  'md-3': 'text-md-3',
  lg: 'text-lg',
}
export type FieldText = keyof typeof TEXT

const RADIUS = {
  md: 'radius-md',
  lg: 'radius-lg',
}
export type FieldRadius = keyof typeof RADIUS

type ClassObject = {
  padding: FieldPadding
  radius: FieldRadius
  text: FieldText
}
const PRESET: Record<string, ClassObject> = {
  // sm: {
  //   padding: 'sm',
  //   radius: 'md',
  //   text: 'sm',
  // },
  // md: {
  //   padding: 'md',
  //   radius: 'md',
  //   text: 'md',
  // },
  // lg: {
  //   padding: 'lg',
  //   radius: 'lg',
  //   text: 'lg',
  // },
}
export type FieldPreset = keyof typeof PRESET

const {
  variant = 'black',
  padding = 'md',
  text = 'md',
  radius = 'md',
  preset,
  centerText,
} = defineProps<{
  variant?: FieldVariant
  padding?: FieldPadding
  preset?: FieldPreset
  text?: FieldText
  name: string
  placeholder?: string
  radius?: FieldRadius
  centerText?: boolean
  disabled?: boolean
}>()

const classObject = computed(() => {
  const p = preset ? PRESET[preset].padding : padding
  const t = preset ? PRESET[preset].text : text
  const r = preset ? PRESET[preset].radius : radius

  return [
    PADDING[p],
    VARIANT[variant],
    TEXT[t],
    RADIUS[r],
    {
      'center-text': centerText,
    },
  ]
})

const model = defineModel()
</script>

<style lang="scss" scoped>
.field {
  @include flex-container(row, center, normal);
  cursor: text;

  &__input {
    background: none;
    outline: none;
    border: none;
    width: 100%;
  }

  &.center-text {
    input {
      text-align: center;
    }
  }

  &.variant-black {
    background-color: $black;

    input {
      color: $white;
    }

    input::placeholder {
      color: $gray-300;
    }
  }

  &.variant-gray {
    background-color: $gray-900;
    border: 1px solid $outline-15;

    input {
      color: $white;
    }

    input:disabled {
      color: $gray-300;
    }

    input::placeholder {
      color: $white;
    }

    input:disabled::placeholder {
      color: $gray-300;
    }
  }

  &.padding-md {
    padding: 5px 15px;
    gap: 7px;
  }

  &.padding-md-2 {
    padding: 16px;
    gap: 16px;
  }

  &.padding-lg {
    padding: 16px 24px;
  }

  &.text-md {
    input {
      font: $font-body-12;
    }
  }

  &.text-md-2 {
    input {
      font: $font-body-16;
    }
  }

  &.text-md-3 {
    input {
      font: $font-body-14;
    }
  }

  &.text-lg {
    input {
      font: $font-h2-20;
    }
  }

  &.radius-md {
    border-radius: 15px;
  }

  &.radius-lg {
    border-radius: 20px;
  }
}
</style>
