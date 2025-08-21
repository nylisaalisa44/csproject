<template>
  <div class="card">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.card {
  border: 1px solid $outline-15;
  border-radius: 20px;
}
</style>
