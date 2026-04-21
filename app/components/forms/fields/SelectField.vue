<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	modelValue: string;
	name: string;
	options?: { value: string; text: string }[];
	placeholder?: string;
}>();

const emits = defineEmits(['update:modelValue']);

const localValue = computed({
	get: () => props.modelValue,
	set: (value: string) => emits('update:modelValue', value),
});
</script>

<template>	
	<UiSelect v-model="localValue">
		<UiSelectTrigger :id="props.name" class="bg-white dark:bg-black">
			<UiSelectValue :placeholder="props.placeholder || 'Select an option'" />
		</UiSelectTrigger>
		<UiSelectContent class="bg-white dark:bg-black">
			<UiSelectGroup>
				<UiSelectItem v-for="option in props.options ?? []" :key="option.value" :value="option.value">
					{{ option.text }}
				</UiSelectItem>
			</UiSelectGroup>
		</UiSelectContent>
	</UiSelect>
</template>
