<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  fileName: string
}>()

const svgContent = ref<string>('')

watchEffect(async () => {
  if (!props.fileName) return

  try {
    // Dynamically import the raw SVG content
    const svg = await import(`@/assets/img/icons/${props.fileName}.svg?raw`)
    svgContent.value = svg.default
  } catch (e) {
    console.error(`SVG not found: ${props.fileName}`, e)
    svgContent.value = ''
  }
})
</script>

<template>
  <span v-html="svgContent"></span>
</template>

<style scoped>
span svg {
  display: inline-block;
  width: 100%;
  height: auto;
}
</style>
