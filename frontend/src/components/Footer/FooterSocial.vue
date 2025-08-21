<template>
  <div class="social">
    <a target="_blank" v-for="(link, idx) in socials" :key="idx" :href="link"
      ><Icon :size="dt == 'desktop' ? '45' : '32'" :name="SOCIAL_ICON[idx]"
    /></a>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/components/UI/Icon.vue'
import { useDeviceType } from '@/composables/useDeviceType.ts'
import { computed } from 'vue'
import { FOOTER_CONFIG } from '@/components/Footer/data.ts'

const SOCIAL_ICON = {
  instagram: 'transparent_instagram',
  facebook: 'transparent_facebook',
  x: 'transparent_twitter',
  tiktok: 'transparent_tiktok',
  discord: 'transparent_discord',
  vk: 'transparent_vk',
  steam: 'transparent_steam',
}
const dt = useDeviceType()
type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}
const socials = computed<PartialRecord<keyof typeof SOCIAL_ICON, string>>(() =>
  Object.fromEntries(
    Object.entries(FOOTER_CONFIG.social).filter(([, v]) => v != '')
  )
)
</script>

<style lang="scss" scoped>
.social {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  width: fit-content;

  a {
    @include flex-container(column, center, center);
    background-color: $gray-900;
    border-radius: 15px;
    border: 1px solid $outline-15;

    @include media(tablet) {
      border-radius: 10px;
    }
  }
}
</style>
