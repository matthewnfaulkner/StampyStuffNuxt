<script setup lang="ts">
import { getDirectusAssetURL } from '@@/server/utils/directus-utils';
import { watch, ref } from 'vue';

interface DirectusImageProps {
	uuid: string;
	alt: string;
	width?: number;
	height?: number;
	[key: string]: any;
}

const props = withDefaults(defineProps<DirectusImageProps>(), {
	width: undefined,
	height: undefined,
});

const src = ref(getDirectusAssetURL(props.uuid));
const svgContent = ref<string>('')

watch(
  () => props.uuid,
  async (newUuid) => {
    src.value = getDirectusAssetURL(newUuid);

    try {
      const response = await fetch(src.value);
      if (!response.ok) throw new Error('Failed to load SVG');

      svgContent.value = await response.text();
    } catch (e) {
      console.error(`SVG not found: ${src.value}`, e);
      svgContent.value = '';
    }
  },
  { immediate: true }
);


</script>

<template>
  <span class="svgcont" v-html="svgContent"></span>
</template>

<style >
.svgcont svg {
  display: inline-block;
  width: 100%;
  height: auto;
  margin: auto !important;
}
</style>
