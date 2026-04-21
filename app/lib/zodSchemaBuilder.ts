import { z } from 'zod';
import type { FormField } from '@@/shared/types/schema';

export const buildZodSchema = (fields: FormField[]) => {
	const schema: Record<string, z.ZodTypeAny> = {};
	const shopSettingsStore = useShopSettingsStore();
	const shopSettings = shopSettingsStore.getShopSettings() as ShopSettings;
	const shippableCountries = shopSettings.shipping_countries?.countryCodes;
	fields.forEach((field) => {
		let fieldSchema: z.ZodTypeAny;

		switch (field.type) {
			case 'checkbox':
				fieldSchema = z.boolean().default(false);
				break;

			case 'checkbox_group':
				fieldSchema = z.array(z.string()).default([]);
				break;

			case 'radio':
				fieldSchema = z.string();
				break;
			case 'phone':
				fieldSchema = z.string()
						.trim()
						.min(4, "Phone number is required")
						.refine((val) => val.length >= 7, "Phone number too short")
				break;

			case 'address': 
				fieldSchema = z.object({
					street_number: z.string().min(1, 'Street Number Required'),
					address_line_1: z.string().min(1, 'Address Line 1 Required'),
					address_line_2: z.string(),
					city: z.string().min(1, 'City Required'),
					country:  z.string().min(1, 'Country Required').refine(
						(val) => shippableCountries.includes(val) || shippableCountries.length == 0,
						{ message: 'Country is not shippable' }
					),
					postcode: z.string().min(1, 'Post Code Required'),
				})
				break;

			case 'font':
				fieldSchema = z.object({
					text: z.string(),
					font: z.string(),
				})
				break;

			case 'file':
				if(field.max_number_files > 1) {
					if (field.required) {
						fieldSchema = z.array(
							z.instanceof(File, {
							message: `${field.label || field.name} is required`,
							}).or(z.null())
						);
					} else {
						fieldSchema = z
							.array(
								z.instanceof(File, {
								message: `${field.label || field.name} must be a valid file if provided`,
								})// each item can be File or null
							)
							.nullable()   // <--- allows the array itself to be null
							.optional() 
					}
				}
				else {
					if (field.required) {
						fieldSchema = z.instanceof(File, {
							message: `${field.label || field.name} is required`,
						});
					} else {
						fieldSchema = z
							.instanceof(File, {
								message: `${field.label || field.name} must be a valid file if provided`,
							})
							.or(z.undefined());
					}
				}
				break;

			default:
				fieldSchema = z.string();
				break;
		}

		if (field.validation) {
			const rules = field.validation.split('|');
			rules.forEach((rule) => {
				const [ruleName, ruleValue] = rule.split(':');
				const normalizedRule = ruleName?.toLowerCase();

				if (fieldSchema instanceof z.ZodString) {
					switch (normalizedRule) {
						case 'email':
							fieldSchema = fieldSchema.email(`${field.label || field.name} must be a valid email`);
							break;

						case 'url':
							fieldSchema = fieldSchema.url(`${field.label || field.name} must be a valid URL`);
							break;

						case 'min': {
							const min = ruleValue ? parseInt(ruleValue, 10) : 0;
							fieldSchema = fieldSchema.min(min, `${field.label || field.name} must be at least ${min} characters`);
							break;
						}

						case 'max': {
							const max = ruleValue ? parseInt(ruleValue, 10) : Infinity;
							fieldSchema = fieldSchema.max(max, `${field.label || field.name} must be at most ${max} characters`);
							break;
						}

						case 'length': {
							const length = ruleValue ? parseInt(ruleValue, 10) : 0;
							fieldSchema = fieldSchema.length(
								length,
								`${field.label || field.name} must be exactly ${length} characters`,
							);
							break;
						}

						default:
							fieldSchema = fieldSchema.refine(() => false, {
								message: `Unknown validation rule: ${ruleName}`,
							});
					}
				}
				else if (fieldSchema instanceof z.ZodObject){
					if(field.type === 'font') {
						switch (normalizedRule) {
							case 'max': {
								const max = ruleValue ? parseInt(ruleValue, 10) : Infinity;
								fieldSchema.shape.text =  fieldSchema.shape.text.max(max, `${field.label || field.name} must be at most ${max} characters`);
								break;
							}
						}
					}
				}
			});
		}

		if (field.required) {
			if (fieldSchema instanceof z.ZodString) {
				fieldSchema = fieldSchema.nonempty(`${field.label || field.name} is required`);
			}
		} else {
			// Allow empty strings or undefined for optional fields
			fieldSchema = fieldSchema.or(z.literal('')).or(z.undefined());
		}

		if (field.name) {
			schema[field.name] = fieldSchema;
		}
	});

	return z.object(schema);
};
