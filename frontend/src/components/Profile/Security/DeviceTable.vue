<template>
  <div class="devices">
    <table class="table">
      <thead>
        <tr>
          <th>Браузер</th>
          <th class="table__ip">IP Адрес</th>
          <th class="table__geo">Местоположение</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="device in devices">
          <td>
            <DeviceBrowser
              :browser="device.browser"
              :os="device.os"
              :this-device="device.thisDevice"
            />
          </td>
          <td class="table__ip">{{ device.ip }}</td>
          <td class="table__geo">{{ device.geolocation }}</td>
          <td class="table__status">
            <Status :status="device.status" />
          </td>
        </tr>
      </tbody>
    </table>
    <a class="devices__unlink">Отключить другие сеансы</a>
  </div>
</template>

<script lang="ts" setup>
import type { IDevice } from '@/types/device.ts'
import Status from '@/components/Profile/Security/Status.vue'
import DeviceBrowser from '@/components/Profile/Security/DeviceBrowser.vue'

defineProps<{
  devices: IDevice[]
}>()
</script>

<style lang="scss" scoped>
.devices {
  @include flex(column);

  &__unlink {
    color: $gray-300;
    font: $font-body-16;
    text-decoration: underline;

    @include media(mobile) {
      font: $font-body-12;
    }
  }
}

.table {
  border-collapse: separate;
  border-spacing: 0 8px;

  th {
    padding: 12px 24px;
    border: 1px solid $outline-15;
    border-left: none;
    border-right: none;
    font: $font-body-16;
    color: $white;
    text-align: left;
    background-color: $gray-900;

    @include media(tablet) {
      padding: 12px 16px;
    }
  }

  th:first-child {
    border-radius: 15px 0 0 15px;
    border: 1px solid $outline-15;
    border-right: none;
  }

  th:last-child {
    border-radius: 0 15px 15px 0;
    border: 1px solid $outline-15;
    border-left: none;
  }

  td {
    padding: 19px 24px;
    border: 1px solid $outline-15;
    border-left: none;
    border-right: none;
    background-color: $gray-900;

    @include media(tablet) {
      padding: 19px 16px;
    }
  }

  td:first-child {
    border-radius: 15px 0 0 15px;
    border: 1px solid $outline-15;
    border-right: none;
  }

  td:last-child {
    border-radius: 0 15px 15px 0;
    border: 1px solid $outline-15;
    border-left: none;
  }

  &__status {
    @include flex(row);
  }

  &__ip,
  &__geo {
    @include media(mobile) {
      display: none;
    }
  }
}
</style>
