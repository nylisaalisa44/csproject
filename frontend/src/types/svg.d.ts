declare module '*.svg?component' {
  // It's really a string, precisely a resolved path pointing to the image file
  import type { Component } from 'vue'
  const filePath: Component

  export default filePath
}
