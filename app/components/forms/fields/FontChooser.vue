<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	modelValue: {
		text: string,
		font: string,
	};
	name: string;
	options?: { value: string; text: string }[];
	placeholder?: string;
}>();

const emits = defineEmits(['update:modelValue']);

const state = ref({ ...props.modelValue })

state.value = {
	text: '',
	font: 'Lexend'
}

watch(
  state,
  (newVal) => {
    emits('update:modelValue', newVal)
  },
  { deep: true }
)


</script>

<template>	
	<UiInput  v-model="state.text" :placeholder="props.placeholder" class="bg-white text-6xl h-30" :style="{fontFamily: state.font || 'Lexend'}"></UiInput>
	<UiSelect @vue:updated="emits('update:modelValue', state)" v-model="state.font" :default-value="'Lexend'">
		<UiSelectTrigger :id="props.name" class="bg-white dark:bg-black">
			<UiSelectValue placeholder="Select an Font" />
		</UiSelectTrigger>
		<UiSelectContent class="bg-white dark:bg-black" >
			<UiSelectGroup >
				<UiSelectItem v-for="option in props.options ?? []" :key="option.value" :value="option.value" :style="{fontFamily: option.value || 'Lexend'}">
					{{ option.text }}
				</UiSelectItem>
			</UiSelectGroup>
		</UiSelectContent>
	</UiSelect>
</template>
