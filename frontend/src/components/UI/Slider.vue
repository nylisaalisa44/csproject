<template>
  <Slider.Root>
    <Slider.Control>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb :index="0">
        <Slider.HiddenInput />
      </Slider.Thumb>
    </Slider.Control>
  </Slider.Root>
</template>

<script lang="ts" setup>
import { Slider } from '@ark-ui/vue/slider'
</script>

<style lang="scss" scoped>
[data-scope='slider'][data-part='root'] {
  max-width: 320px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

[data-scope='slider'][data-part='control'] {
  --slider-thumb-size: 17px;
  --slider-track-height: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

[data-scope='slider'][data-part='control'][data-orientation='horizontal'] {
  height: var(--slider-thumb-size);
}

[data-scope='slider'][data-part='thumb'] {
  all: unset;
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  border-radius: 999px;
  background: $purple;
}

[data-scope='slider'][data-part='thumb']:after {
  position: relative;
  display: block;
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background-color: $white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

[data-scope='slider'] .control-area {
  margin-top: 12px;
  display: flex;
}

.slider [data-orientation='horizontal'] .control-area {
  flex-direction: column;
  width: 100%;
}

[data-scope='slider'][data-part='track'] {
  background: $gray-300;
  border-radius: 9999px;
}

[data-scope='slider'][data-part='track'][data-orientation='horizontal'] {
  height: var(--slider-track-height);
  width: 100%;
}

[data-scope='slider'][data-part='range'] {
  background: $purple;
  border-radius: inherit;
}

[data-scope='slider'][data-part='range'][data-orientation='horizontal'] {
  height: 100%;
}

[data-scope='slider'][data-part='value-text'] {
  margin-inline-start: 12px;
}

[data-scope='slider'][data-part='dragging-indicator'] {
  background: magenta;
  border-radius: 4px;
  padding: 2px 4px;
  color: $purple;

  &[data-orientation='horizontal'] {
    top: calc(var(--slider-thumb-size) + 8px);
  }
}
</style>
