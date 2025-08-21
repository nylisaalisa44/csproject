import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMenuStore = defineStore('menu', () => {
  const isOpened = ref(false)

  function open() {
    isOpened.value = true
  }

  function close() {
    isOpened.value = false
  }

  function toggle() {
    isOpened.value = !isOpened.value
  }

  return { isOpened, open, close, toggle }
})
