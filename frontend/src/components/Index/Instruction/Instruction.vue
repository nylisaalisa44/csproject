<template>
  <div class="sell">
    <div class="sell__title">Как продать скины CS2</div>
    <div class="sell__wrapper">
      <InstructionCard
        title="Войдите через Steam"
        :step="Step1"
        description="Настройте свою ссылку для обмена и адрес электронной почты"
      />
      <InstructionCard
        title="Выберите скины на продажу"
        :step="Step2"
        description="Выберите скины которые хотите продать из вашего инвентаря и отправьте их на продажу"
      />
      <InstructionCard
        title="Получите ваши средства"
        :step="Step3"
        description="Укажите реквизиты и получите моментальную выплату"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import InstructionCard from '@/components/Index/Instruction/InstructionCard.vue'
import Step1 from '@/assets/images/instruction/step-1.svg?component'
import Step2 from '@/assets/images/instruction/step-2.svg?component'
import Step3 from '@/assets/images/instruction/step-3.svg?component'
</script>

<style lang="scss" scoped>
.sell {
  @include flex-container(column, center, flex-start);
  gap: 24px;
  padding: 86px 0;

  @include media(tablet) {
    padding: 64px 0;
  }

  @include media(mobile) {
    padding: 32px 0;
  }

  &__title {
    font: $font-h1-64;
    background: $gradient-white;
    background-clip: text;

    @include media(mobile) {
      font: $font-h2-24;
    }
  }

  &__wrapper {
    @include flex-container(row, flex-start, space-between);
    background: $gradient-black;
    padding: 32px;
    border: 1px solid $outline-15;
    border-radius: 20px;
    width: 100%;

    @include media(mobile) {
      @include flex-container(column, normal, flex-start);
      gap: 32px;
    }
  }
}
</style>
