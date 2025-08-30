<template>
  <div class="security">
    <SteamGuard />
    <div class="security__title">Веб-сеансы</div>
    <DeviceTable :devices="DEVICES" />
    <DeleteAccount />
  </div>
</template>

<script lang="ts" setup>
import SteamGuard from '@/components/Profile/Security/SteamGuard.vue'
import DeviceTable from '@/components/Profile/Security/DeviceTable.vue'
import type { IDevice } from '@/types/device.ts'
import DeleteAccount from '@/components/Profile/Security/DeleteAccount.vue'

const DEVICES: IDevice[] = [
  {
    browser: 'Google Chrome',
    os: 'Windows 11',
    geolocation: 'RU',
    status: 'active',
    ip: '54.10.102.213',
    thisDevice: true,
  },
  {
    browser: 'Firefox',
    os: 'Kali',
    geolocation: 'US',
    status: 'inactive',
    ip: '99.103.245.33',
  },
]
</script>

<style lang="scss" scoped>
.security {
  @include flex(column);
  gap: 24px;
  width: 100%;

  @include media(tablet) {
    gap: 16px;
  }

  @include media(mobile) {
    gap: 24px;
  }

  &__title {
    font: $font-h2-24;
    color: $white;

    @include media(mobile) {
      font: $font-h2-20-m;
    }
  }
}
</style>
