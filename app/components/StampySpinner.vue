<script setup lang="ts">

const { $rive } = useNuxtApp();

//rive
const canvas = ref<HTMLCanvasElement | null>(null);

const props = defineProps({
  size: {
    type: Number,
    default: 48, // spinner size in px
  },
  src: {
    type: String,
    default: '/animations/stampy_logo.riv',
  },
  artboard: {
    type: String,
    default: undefined,
  },
  animation: {
    type: String,
    default: 'Timeline 1', // your animation name from Rive
  },
})

onMounted(() => {
  const Rive = $rive;
  if (!canvas.value) return  // Safety check

  const riveInstance = new Rive({
    src: '/animations/stampy_logo.riv',
    canvas: canvas.value,
    artboard: 'logo',
    autoplay: true,
    animations: 'Timeline 1',
    onLoad: () => {
      riveInstance.resizeDrawingSurfaceToCanvas();
    },
  })
})

</script>

<template>
  <canvas
    ref="canvas"
    :style="{ width: props.size + 'em', height: props.size + 'em' }"
    class="block max-h-dvw max-w-full" />
</template>
