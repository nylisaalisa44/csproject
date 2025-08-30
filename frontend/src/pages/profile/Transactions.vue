<template>
  <div class="transactions">
    <div class="transactions__balance">
      <div class="transactions__balance-wrapper">
        <BalanceCard title="Доступный баланс" :balance="availableBalance" />
        <BalanceCard title="Баланс в холде" :balance="holdBalance" />
      </div>
      <div class="transactions__balance-btns">
        <Button variant="purple" preset="sm">Пополнить</Button>
        <Button variant="purple" preset="sm">Вывести</Button>
      </div>
    </div>
    <FilterBar />
    <div class="transactions__list">
      <Transaction
        :transaction="{
          type: 'buy',
          status: 'failed',
          data: {
            date: 1756472983,
            itemImage: '/test-item.webp',
            price: '$ 200',
            sellerImage: 'https://i.pravatar.cc/300',
          },
        }"
      />
      <Transaction
        :transaction="{
          type: 'buy',
          status: 'completed',
          data: {
            date: 1756472983,
            itemImage: '/test-item.webp',
            price: '$ 200',
            sellerImage: 'https://i.pravatar.cc/300',
          },
        }"
      />
      <Transaction
        :transaction="{
          type: 'deposit',
          status: 'completed',
          data: {
            date: 1756472983,
            walletAddress: '35bSzXvRKLpHsHMrzb82f617cV4Srnt7hS',
            amount: '$ 300',
          },
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BalanceCard from '@/components/Profile/Transactions/BalanceCard.vue'
import { ref } from 'vue'
import Button from '@/components/UI/Button.vue'
import FilterBar from '@/components/Profile/Transactions/FilterBar.vue'
import Transaction from '@/components/Profile/Transactions/Transaction.vue'

const availableBalance = ref({
  usd: '$ 25.00',
  btc: '0.00015 BTC',
})
const holdBalance = ref({
  usd: '$ 25.00',
  btc: '0.00015 BTC',
})
</script>

<style lang="scss" scoped>
.transactions {
  @include flex(column);
  width: 100%;
  gap: 16px;

  &__balance {
    @include flex(column);
    gap: 8px;
  }

  &__balance-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @include media(tablet) {
      gap: 8px;
    }

    @include media(mobile) {
      gap: 12px;
      grid-template-columns: 1fr;
    }
  }

  &__balance-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @include media(tablet) {
      gap: 8px;
    }

    @include media(mobile) {
      gap: 6px;
    }
  }

  &__list {
    @include flex(column);
    gap: 8px;
  }
}
</style>
