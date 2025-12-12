<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const parentRef = ref(null)
const inView = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        inView.value = true
        observer.disconnect() // play once
      }
    },
    { threshold: 0.2 }
  )
  if (parentRef.value) observer.observe(parentRef.value)
})
</script>

<template>
  <div ref="parentRef" :class="{ 'in-view': inView }">
    <slot />
  </div>
</template>
