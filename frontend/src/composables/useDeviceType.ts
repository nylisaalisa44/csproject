import { onMounted, onUnmounted, ref } from 'vue'

const DEFAULT_WIDTH = 1440
const DEVICE = {
  desktop: 9999,
  tablet: 1440,
  mobile: 1009,
}
export type DeviceType = keyof typeof DEVICE

export function useDeviceType() {
  const deviceType = ref<DeviceType>('desktop')

  const resize = () => {
    let windowWidth = DEFAULT_WIDTH
    if (window) {
      windowWidth = window.innerWidth
    }

    if (windowWidth < DEVICE.desktop) {
      deviceType.value = 'desktop'
    }

    if (windowWidth < DEVICE.tablet) {
      deviceType.value = 'tablet'
    }

    if (windowWidth < DEVICE.mobile) {
      deviceType.value = 'mobile'
    }
  }

  onMounted(() => {
    resize()
    addEventListener('resize', resize)
  })

  onUnmounted(() => {
    removeEventListener('resize', resize)
  })

  return deviceType
}
