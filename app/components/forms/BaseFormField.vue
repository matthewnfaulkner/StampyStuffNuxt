<script setup lang="ts">
import type { FormField } from '#shared/types/schema';
import { useField } from 'vee-validate';
import { Info } from 'lucide-vue-next';

import Input from '@/components/ui/input/Input.vue';
import { Textarea } from '~/components/ui/textarea';
import CheckboxField from './fields/CheckboxField.vue';
import CheckboxGroupField from './fields/CheckboxGroupField.vue';
import RadioGroupField from './fields/RadioGroupField.vue';
import SelectField from './fields/SelectField.vue';
import FileUploadField from './fields/FileUploadField.vue';
import DateTime from './fields/DateTime.vue';
import FormLabel from '../ui/form/FormLabel.vue';
import FontChooser from './fields/FontChooser.vue';
import AddressField from './fields/AddressField.vue';
import PhoneField from './fields/PhoneField.vue';

const props = defineProps<{ field: FormField }>();
const { value, errorMessage } = useField(props.field.name ?? '');

const componentMap: Record<string, Component> = {
	textarea: Textarea,
	checkbox: CheckboxField,
	checkbox_group: CheckboxGroupField,
	radio: RadioGroupField,
	select: SelectField,
	file: FileUploadField,
	datetime: DateTime,
	font: FontChooser,
	address: AddressField,
	phone: PhoneField,
};

const getFieldComponent = () => componentMap[props.field.type ?? ''] || Input;

const getComponentProps = (field: FormField) => {
	const baseProps = {
		id: field.id,
		name: field.name ?? '',
		placeholder: field.placeholder ?? '',
		modelValue: value.value,
		'onUpdate:modelValue': (val: any) => (value.value = val),
	};

	if (['checkbox_group', 'radio', 'select', 'font'].includes(field.type ?? '')) {
		return { ...baseProps, options: field.choices ?? [] };
	}

	if (field.type === 'checkbox') {
		return { ...baseProps, label: field.label ?? '' };
	}

	if (field.type === 'textarea') {
		return  { ...baseProps, rows: "10"};
	}

	if (field.type === 'file') {
		return  { ...baseProps, maxNumberFiles: field?.max_number_files, maxFileSize: field?.max_file_size, allowedFileTypes: field?.allowed_file_types, };
	}

	return baseProps;
};
</script>

<template>
	
	<div v-if="props.field.type !== 'hidden'" :class="`field-width-${field.width ?? '100'}`">
		<UiFormItem class="pt-2">
			<FormLabel :for="field.name ?? ''" class="flex items-center justify-between">
				<div class="flex items-center space-x-1 h-[20px]">
					<span v-if="field.type !== 'checkbox'">{{ field.label ?? '' }}</span>
				</div>
				<span v-if="field.required" class="text-sm text-gray-400">*Required</span>
				
			</FormLabel>
			<UiFormControl class="">
				<component :is="getFieldComponent()" v-bind="getComponentProps(field)" class="bg-white dark:bg-black" />
			</UiFormControl>
			<UiFormMessage v-if="errorMessage" class="text-red-500 italic text-sm">{{ errorMessage }}</UiFormMessage>
			<div v-if="field.help" class="flex items-center space-x-1 h-[20px] py-7 text-xs text-muted dark:text-gray-300">
					<p class="bg-none">{{ field.help }}</p>
			</div>
		</UiFormItem>
	</div>
</template>

<style scoped>
.field-width-100 {
	flex: 100%;
}
.field-width-50 {
	flex: calc(50% - 1rem);
}
.field-width-67 {
	flex: calc(67% - 1rem);
}
.field-width-33 {
	flex: calc(33% - 1rem);
}
</style>
