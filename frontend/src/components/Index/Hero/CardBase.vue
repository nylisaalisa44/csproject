<template>
  <div class="card">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.card {
  border-radius: 20px;
  border: 1px solid $outline-15;

  @include media(tablet) {
    border-radius: 15px;
  }
}
</style>
