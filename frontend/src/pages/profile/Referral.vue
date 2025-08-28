<template>
  <div class="referral">
    <div class="referral__title">Как это работает?</div>
    <div class="referral__cards">
      <InfoCard
        title="Поделитесь ссылкой"
        description="Рекламируйте свою реферальную ссылку в социальных сетях"
        icon="people"
      />
      <InfoCard
        title="Отслеживайте статистику"
        description="Отслеживайте прозрачную статистику ваших рефералов с точным отчетами"
        icon="status-up"
      />
      <InfoCard
        title="Получите комиссионые"
        description="Получайте пассивный доход от каждого обмена, который совершают привлеченные вами пользователи."
        icon="wallet-add"
      />
    </div>
    <LabelWrapper title="Реферальная ссылка">
      <Field
        v-model="referralLink"
        variant="gray"
        padding="md-2"
        :text="dt === 'desktop' ? 'md-2' : 'md-3'"
        radius="lg"
        name="referralLink"
        disabled
      >
        <template v-slot:right>
          <Icon
            @click="copyReferralLink"
            class="referral__link-icon"
            name="copy"
          />
        </template>
      </Field>
    </LabelWrapper>
    <div class="referral__title">Статистика</div>
    <div class="referral__statistics">
      <ReferralStatistics :statistics="STATISTICS" />
      <DonutChartCard
        :values="[300, 200]"
        :colors="['white', '#7558e3']"
        :titles="['Холд', 'Завершено']"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import InfoCard from '@/components/Profile/Referral/InfoCard.vue'
import LabelWrapper from '@/components/Profile/LabelWrapper.vue'
import Field from '@/components/UI/Field.vue'
import Icon from '@/components/UI/Icon.vue'
import { ref } from 'vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'
import ReferralStatistics, {
  type Statistics,
} from '@/components/Profile/Referral/ReferralStatistics.vue'
import DonutChartCard from '@/components/Profile/Referral/DonutChartCard.vue'

const STATISTICS: Statistics = {
  totalRegistrations: 58,
  totalTradingVolume: '329 $',
  totalDeals: 48,
  totalRevenue: '16 $',
  holdAmount: '0 $',
  totalWithdrawal: '14 $',
}

const referralLink = ref('https://stoneskins.gg/?ref=ivanivanov')
const dt = useDeviceType()

const copyReferralLink = async () => {
  await navigator.clipboard.writeText(referralLink.value)
}
</script>

<style lang="scss" scoped>
.referral {
  @include flex(column);
  gap: 24px;
  width: 100%;

  @include media(mobile) {
    gap: 16px;
  }

  &__title {
    font: $font-h2-24;
    color: $white;

    @include media(mobile) {
      font: $font-h2-20-m;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @include media(tablet) {
      gap: 12px;
    }

    @include media(mobile) {
      gap: 8px;
      grid-template-columns: 1fr;
    }
  }

  &__link-icon {
    color: $gray-300;
    cursor: pointer;
  }

  &__statistics {
    @include flex(row);
    gap: 16px;
    width: 100%;

    @include media(tablet) {
      gap: 12px;
    }

    @include media(mobile) {
      gap: 8px;
      flex-direction: column;
    }
  }
}
</style>
