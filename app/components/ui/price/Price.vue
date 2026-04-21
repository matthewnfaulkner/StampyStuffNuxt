<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '#shared/utils'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  currency: string | number
  amount: string | number
  class?: HTMLAttributes['class']
}>()

</script>

<template>
  <p :class="cn('', props.class)">{{ currency }} {{ amount }}</p>
</template>
