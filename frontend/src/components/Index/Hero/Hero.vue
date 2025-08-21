<template>
  <div class="hero">
    <div class="hero__wrapper">
      <Main class="hero__main" />
      <div class="hero__right">
        <Trust class="cell-1" />
        <CardTextIcon class="cell-2" :icon="TimerIcon"
          >Самые быстрые выплаты и трейды</CardTextIcon
        >
        <CardTextIcon class="cell-3" :icon="ShieldIcon"
          >Торгуйте безопасно на нашей платорме</CardTextIcon
        >
        <Withdrawal class="cell-4" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Trust from '@/components/Index/Hero/Trust.vue'
import CardTextIcon from '@/components/Index/Hero/CardTextIcon.vue'
import TimerIcon from '@/assets/images/hero/timer.svg?component'
import ShieldIcon from '@/assets/images/hero/shield-security.svg?component'
import Withdrawal from '@/components/Index/Hero/Withdrawal.vue'
import Main from '@/components/Index/Hero/Main.vue'
</script>

<style lang="scss" scoped>
.hero {
  padding: 30px 0;

  @include media(mobile) {
    padding: 16px 0;
  }

  &__wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    @include media(mobile) {
      grid-template-columns: 1fr;
    }
  }

  &__main {
    grid-column: 1 / 3;
  }

  &__right {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    grid-column: 3 / 4;

    @include media(mobile) {
      grid-column: 1 / 3;
    }

    .cell-1 {
      grid-column: 1 / 3;
    }

    .cell-2 {
      grid-column: 1 / 2;
    }

    .cell-3 {
      grid-column: 2 / 3;
    }

    .cell-4 {
      grid-column: 1 / 3;
    }
  }
}
</style>
