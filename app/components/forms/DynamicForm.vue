<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { buildZodSchema } from '@/lib/zodSchemaBuilder';
import type { FormField } from '#shared/types/schema';
import BaseFormField from './BaseFormField.vue';
import BaseButton from '../base/BaseButton.vue'
import { empty } from '#build/ui';

const props = defineProps<{
	fields: FormField[];
	onSubmit: (data: Record<string, any>) => Promise<void> | void;
	submitLabel: string;
	formId?: string;
	initialValues?: Record<string, any>
}>();

const isSubmitting = ref(false);

const { setAttr } = useVisualEditing();

const sortedFields = computed(() => [...props.fields].sort((a, b) => (a.sort || 0) - (b.sort || 0)));

const validFields = computed(() =>
	sortedFields.value.filter((field): field is FormField & { name: string } => field.name != null && field.name !== ''),
);

const schema = computed(() => {
	if (!validFields.value.length) return null;
	try {
		const zodSchema = buildZodSchema(validFields.value);
		return toTypedSchema(zodSchema);
	} catch {
		return null;
	}
});

const defaultValues = props.initialValues ? props.initialValues : {};

const initialValues = computed(() => {
	if (!validFields.value.length) return {};
	return validFields.value.reduce(
		(defaults, field) => {
			const name = field.name;

			switch (field.type) {
				case 'checkbox':
					defaults[name] = defaultValues[name] || false;
					break;
				case 'checkbox_group':
					defaults[name] =  defaultValues[name] || [];
					break;
				case 'select':
				case 'radio':
					defaults[name] =  defaultValues[name] || '';
					break;
				case 'file':
					if(defaultValues[name] instanceof Array && defaultValues[name].length > 0) {
						let notFileFlag = false
						defaultValues[name].forEach((value) => {
							if (!(value instanceof File)) {
								defaults[name] = null;
								notFileFlag = true;
							};
						})
						if (!notFileFlag) {
							defaults[name] = defaultValues[name];
						}
					}
					else{
						defaults[name] = defaultValues[name] instanceof File ? defaultValues[name] : null;
					}
					break;
				
				case 'address': {
					const addr = defaultValues[name] ?? {};
					defaults[name] = {
						street_number: addr['street-number'] || addr['street_number'] || '',
						address_line_1: addr['address-line-1'] || addr['address_line_1'] || '',
						address_line_2: addr['address-line-2'] || addr['address_line_2'] || '',
						city: addr['city'] || '',
						country: addr['country'] || '',
						state: addr['state'] || '',
						postcode: addr['postcode'] || '',
					};
					break;
				}
				case 'phone':
				case 'textarea':
				case 'text':
				case 'datetime':
				default:	
					defaults[name] =  defaultValues[name] || '';
			}

			return defaults;
		},
		{} as Record<string, any>,
	);
});

const { handleSubmit, values, setValues: veeSetValues } = useForm({
	validationSchema: schema,
	initialValues: initialValues.value,
});

defineExpose({
  values,
  setValues: veeSetValues,
});

const emit = defineEmits<{ 'address-country-change': [country: string] }>();

const addressFieldName = computed(() => validFields.value.find(f => f.type === 'address')?.name);

watch(
	() => addressFieldName.value ? (values[addressFieldName.value] as any)?.country : undefined,
	(country) => { if (country) emit('address-country-change', country) }
);

const onSubmitForm = handleSubmit(async (formValues) => {
	if (isSubmitting.value) return;
	try {
		isSubmitting.value = true;
		await props.onSubmit(formValues);
	} finally {
		isSubmitting.value = false;
	}
});
</script>	

<template>
	<form
		v-if="schema"
		:validation-schema="schema"
		:initial-values="initialValues"
		:data-directus="
			setAttr({
				collection: 'forms',
				item: props.formId,
				fields: 'fields',
				mode: 'popover',
			})
		"
		@submit.prevent="onSubmitForm"
	>
		<div class="flex flex-wrap gap-4">
			<BaseFormField v-for="field in validFields" :key="field.id" :field="field" :model-value="values[field.name]" />
			<slot name="stripe"/>
			<div class="w-full flex justify-center">
				<div>
					<BaseButton
						:id="`submit-${submitLabel.replace(/\s+/g, '-').toLowerCase()}`"
						type="submit"
						:label="submitLabel"
						variant="solid"
						:disabled="isSubmitting"
						icon="arrow"
						icon-position="right"
						class="bg-info text-white"
					/>
				</div>
			</div>
		</div>
	</form>
</template>
