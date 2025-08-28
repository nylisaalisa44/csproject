<template>
  <Switch.Root>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label><slot /></Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
</template>

<script lang="ts" setup>
import { Switch } from '@ark-ui/vue/switch'
</script>

<style lang="scss" scoped>
[data-scope='switch'][data-part='root'] {
  display: flex;
  align-items: center;
  position: relative;
  width: fit-content;

  --switch-track-diff: calc(
    var(--switch-track-width) - var(--switch-track-height)
  );
  --switch-thumb-x: var(--switch-track-diff);
  --switch-track-width: 44px;
  --switch-track-height: 24px;
}

[data-scope='switch'][data-part='control'] {
  display: inline-flex;
  flex-shrink: 0;
  -webkit-box-pack: start;
  justify-content: flex-start;
  box-sizing: content-box;
  cursor: pointer;
  border-radius: 9999px;
  padding: 0.125rem;
  width: var(--switch-track-width);
  height: var(--switch-track-height);
  transition-property:
    background-color, border-color, color, fill, stroke, opacity, transform;
  transition-duration: 150ms;
  border: 1px solid $outline-15;

  --switch-bg: $gray-900;
  background: var(--switch-bg);
}

[data-scope='switch'][data-part='control'][data-state='checked'] {
  --switch-bg: #{$purple};
  border: 1px solid transparent;
}

[data-scope='switch'][data-part='control'][data-disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}

[data-scope='switch'][data-part='thumb'] {
  background: white;
  transition-property: transform;
  transition-duration: 200ms;
  border-radius: inherit;
  width: var(--switch-track-height);
  height: var(--switch-track-height);
  position: relative;
}

[data-scope='switch'][data-part='thumb']:before {
  transition: background-color $transition-base;
  position: absolute;
  --thumb-size: calc(var(--switch-track-height) + 0.7rem);
  height: var(--thumb-size);
  width: var(--thumb-size);
  background-color: transparent;
  content: '';
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: inherit;
}

[data-scope='switch'][data-part='thumb'][data-state='checked'] {
  transform: translateX(var(--switch-thumb-x));
}

[data-scope='switch'][data-part='label'] {
  user-select: none;
  margin-inline-start: 0.5rem;
  color: $gray-300;
  font: $font-body-16;
}
</style>
