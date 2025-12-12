interface SubmissionValue {
	field: string;
	value?: string;
	file?: string;
}

import { Order, Customer, CustomerAddress, OrderItem, OrderItemSubmission} from '#shared/types/schema';

export default defineEventHandler(async (event) => {

	const config = useRuntimeConfig();
	const formData = await readMultipartFormData(event);
	if (!formData) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid form submission',
		});
	}

	const TOKEN = config.directusFormToken as string;

	if (!TOKEN) {
		throw createError({
			statusCode: 500,
			statusMessage: 'DIRECTUS_SERVER_TOKEN is not defined. Check your .env file.',
		});
	}

	// type-guard to check if a key exists in an object
	function hasKey<T extends object>(
		obj: T,
		key: PropertyKey
		): key is keyof T {
		return key in obj;
	}

	function setValue<T extends object, K extends keyof T>(
		obj: Partial<T>,
		key: K,
		value: T[K]
		) {
		obj[key] = value;
	}

	try {
		const orderValues: Partial<Order> = {};
		const customerValues: Partial<Customer> = {};
		const addressValues: Partial<CustomerAddress> = {};
		const orderItems:    Partial<OrderItem> = {};
		const orderItemSubmission: Partial<OrderItemSubmission> = {};
		let formId = '';
		let fields = [];

		for (const field of formData) {
			if (field.name === 'formId') {
				formId = field.data.toString();
			} else if (field.name === 'fields') {
				fields = JSON.parse(field.data.toString());
			}
		}
        
		for (const field of formData) {
			if (!field.name || !field.data) continue;
			if (field.name === 'formId' || field.name === 'fields') continue;

			const matchingField = fields.find((f: { name: string | undefined }) => f.name === field.name);
			if (!matchingField) continue;

			if (field.filename) {
				const blob = new Blob([field.data], { type: field.type });

				const uploadFormData = new FormData();
				uploadFormData.append('file', blob, field.filename);

				const uploadedFile = (await directusServer.request(withToken(TOKEN, uploadFiles(uploadFormData)))) as {
					id?: string;
				};

				if (uploadedFile?.id) {
					submissionValues.push({
						field: matchingField.id,
						file: uploadedFile.id,
					});
				}
			} else {
				

			}
		}

		const payload = {
			values: submissionValues,
		};

		await directusServer.request(withToken(TOKEN, createItem('customers', submissionValues)));
		await directusServer.request(withToken(TOKEN, createItem('customer_addresses', submissionValues)));
		await directusServer.request(withToken(TOKEN, createItem('order_items', submissionValues)));
		await directusServer.request(withToken(TOKEN, createItem('order_item_submissions', submissionValues)));
		await directusServer.request(withToken(TOKEN, createItem('orders', submissionValues)));

		return { success: true };
	} catch {
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
