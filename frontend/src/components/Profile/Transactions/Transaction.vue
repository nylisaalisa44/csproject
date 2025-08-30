<template>
  <Collapsible.Root>
    <Collapsible.Trigger>
      <CardBase class="transaction">
        <div class="transaction__left">
          <div class="transaction__type">{{ TYPE[transaction.type] }}</div>
          <div class="transaction__amount">{{ amount }}</div>
        </div>
        <div class="transaction__center">
          <TransactionTrade
            v-if="transaction.type == 'buy' || transaction.type == 'sell'"
            :trade="trade"
          />
          <div v-else class="transaction__wallet">{{ walletAddress }}</div>
        </div>
        <div class="transaction__right">
          <div class="transaction__date">{{ date }}</div>
          <TransactionStatus :status="transaction.status" />
          <Collapsible.Indicator>
            <Icon name="arrow-down" />
          </Collapsible.Indicator>
        </div>
      </CardBase>
    </Collapsible.Trigger>
    <Collapsible.Content>
      <CardBase class="transaction__content">
        <div class="transaction__content-amount">{{ amount }}</div>
        <TransactionTrade
          v-if="transaction.type == 'buy' || transaction.type == 'sell'"
          :trade="trade"
        />
        <div v-else class="transaction__content-wallet">
          {{ walletAddress }}
        </div>
        <div class="transaction__content-date">{{ date }}</div>
      </CardBase>
    </Collapsible.Content>
  </Collapsible.Root>
</template>

<script lang="ts" setup>
import type { ITransaction } from '@/types/transaction.ts'
import { Collapsible } from '@ark-ui/vue/collapsible'
import CardBase from '@/components/Profile/CardBase.vue'
import Icon from '@/components/UI/Icon.vue'
import { computed } from 'vue'
import { formatDate } from '@/utils/utils.ts'
import TransactionStatus from '@/components/Profile/Transactions/TransactionStatus.vue'
import TransactionTrade, {
  type Trade,
} from '@/components/Profile/Transactions/TransactionTrade.vue'

const { transaction } = defineProps<{
  transaction: ITransaction
}>()

const TYPE = {
  buy: 'Покупка',
  sell: 'Продажа',
  withdrawal: 'Вывод',
  deposit: 'Пополнение',
}
const amount = computed(() => {
  switch (transaction.type) {
    case 'buy':
      return `- ${transaction.data.price}`
    case 'sell':
      return `+ ${transaction.data.price}`
    case 'withdrawal':
      return `- ${transaction.data.amount}`
    case 'deposit':
      return `+ ${transaction.data.amount}`
  }
})
const date = computed(() => formatDate(transaction.data.date * 1000))
const trade = computed<Trade>(() => {
  if (transaction.type != 'buy' && transaction.type != 'sell')
    return { itemImage: '', traderImage: '' }

  return {
    itemImage: transaction.data.itemImage,
    traderImage:
      transaction.type == 'buy'
        ? transaction.data.sellerImage
        : transaction.data.buyerImage,
  }
})
const walletAddress = computed(() => {
  if (transaction.type != 'withdrawal' && transaction.type != 'deposit')
    return ''

  return `BTC ${transaction.data.walletAddress.slice(0, 4)}...${transaction.data.walletAddress.slice(-4)}`
})
</script>

<style lang="scss" scoped>
@keyframes slideDown {
  from {
    opacity: 0.01;
    height: 0;
  }
  to {
    opacity: 1;
    height: var(--height);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    height: var(--height);
  }
  to {
    opacity: 0.01;
    height: 0;
  }
}

[data-scope='collapsible'][data-part='trigger'] {
  width: 100%;
  cursor: pointer;
  background: none;
  outline: none;
  border: none;
}

[data-scope='collapsible'][data-part='indicator'] {
  @include flex-container(column, center, center);
  color: $gray-300;
  transition: transform $transition-base;
}

[data-scope='collapsible'][data-part='indicator'][data-state='open'] {
  transform: rotate(180deg);
}

[data-scope='collapsible'][data-part='content'] {
  margin-top: 4px;
  overflow: hidden;
}

[data-scope='collapsible'][data-part='content'][data-state='open'] {
  animation: slideDown 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
}

[data-scope='collapsible'][data-part='content'][data-state='closed'] {
  animation: slideUp 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
}

.transaction {
  @include flex-container(row, center, space-between);
  padding: 15px 24px;

  @include media(mobile) {
    padding: 12px 16px;
  }

  &__left {
    @include flex-container(row, center, space-between);
    width: 176px;
  }

  &__type {
    color: $white;
    font: $font-body-16;
  }

  &__amount {
    color: $white;
    font: $font-body-16;

    @include media(mobile) {
      display: none;
    }
  }

  &__right {
    @include flex-container(row, center, space-between);
    width: 290px;

    @include media(tablet) {
      width: 196px;
    }

    @include media(mobile) {
      justify-content: flex-end;
      gap: 8px;
    }
  }

  &__center {
    @include media(mobile) {
      display: none;
    }
  }

  &__date {
    color: $white;
    font: $font-body-16;

    @include media(mobile) {
      display: none;
    }
  }

  &__content {
    @include flex-container(row, center, space-between);
    padding: 12px 16px;
  }

  &__wallet {
    color: $gray-300;
    font: $font-body-16;
  }

  &__content-amount,
  &__content-date {
    color: $white;
    font: $font-body-14;
  }

  &__content-wallet {
    font: $font-body-16;
    color: $gray-300;
  }
}
</style>
