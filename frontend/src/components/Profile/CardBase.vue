<template>
  <div class="card">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.card {
  background-color: $gray-900;
  border-radius: 20px;
  border: 1px solid $outline-15;

  @include media(tablet) {
    border-radius: 15px;
  }
}
</style>
