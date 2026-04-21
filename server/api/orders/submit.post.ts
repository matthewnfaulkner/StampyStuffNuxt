import { Customer, CustomerAddress, OrderItem, ProductVariant } from "~~/shared/types/schema";
import { type CartOrderItem, type CustomisationFile, type CustomisationField } from '#shared/types/checkoutTypes'
import { DirectusFile } from "@directus/sdk";


interface SubmissionValue {
	field: string;
	value?: string;
	file?: string;
}

type ProductAmount = {
	quantity: number;
	price: number;
	total: number;
}

type UploadedFile = {
	id?: string,
	blob: Blob;
	filename: string;
	fileId?: string;
}

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

	try {
		const submissionValues: SubmissionValue[] = [];
		let orderId = '';
		let fields = [];
		let fileKeys: Record<string, UploadedFile[]> = {};
		let orderItems: CartOrderItem[] = [];
		let checkoutTotal = 0;
        const newCustomer: Customer = {
			email: '',
			phone: '',
			first_name: '',
			last_name: '',
			addresses: []
		};

		const address: CustomerAddress = {
			is_shipping: true,
			is_active: true
		}
		let customerId: string | null = null;
		let addressId: string | null = null;

		for (const field of formData) {
			if (field.name === 'orderId') {
				orderId = field.data.toString();
			} else if (field.name === 'fields') {
				fields = JSON.parse(field.data.toString());
			} else if (field.name === 'orderItems') {
				orderItems = JSON.parse(field.data.toString()) as CartOrderItem[];
			} else if (field.name === 'checkoutTotal') {
				checkoutTotal = parseFloat(field.data.toString()) || 0;
			}
		}
		
		//get all product variant Ids of order items. Take opportunity to pull out file keys.
		const productIds = orderItems.reduce<Record<string, number>>(
			(acc, cartItem) => {
			// main product
			acc[cartItem.variantId] = cartItem.quantity

			// addons (if any)
			cartItem.addons?.forEach((addon) => {
				acc[addon.variantId] = cartItem.quantity
			})
			
			//get files whilst we're here.
			cartItem.customisationFields?.forEach((field) => {
				if(field.type == 'file') {
					if (field.value instanceof Array) {
						field.value.forEach((fileName, index) => {
							const key = cartItem.id + '_' + field.id;
							const file = formData.find((f) => f.name == key + '_' + index)
							if (file) {
								const blob = new Blob([file.data], { type: file.type });
								
								if(!fileKeys[key]) {
									fileKeys[key] = [];
								}

								fileKeys[key].push({
										blob: blob,
										fileId: key + '_' + index,
										filename: fileName
									}
								)
								}
							}
						)
					}
				}
			})
			return acc
			},
			{}
		)

		
		let products: ProductVariant[];

		products = (await directusServer.request(
			readItems('product_variants', {
			filter: {
				id: {
				_in: Object.keys(productIds)
				}
			},
			fields: ['id', 'price']
			// Deep query options for complex nested data:
			// - Sort blocks by their sort order
			// - Filter out hidden blocks

			}),
		)) as unknown as ProductVariant[];

		if(!products || products.length != Object.keys(productIds).length) {
			throw createError({ statusCode: 404, statusMessage: 'None/Missing Products Found for given IDs' });
		}

		let total: number = 0;

		//check prices against server an calculate total per product variant
		const ProductsWithPrices = products.reduce<Record <string, ProductAmount>>(
			(acc, product) => {
				
				if(!product.price) {
					throw createError({ statusCode: 404, statusMessage: 'Price Missing' });
				}
				if(!productIds[product.id]) {
					throw createError({ statusCode: 404, statusMessage: 'Fetched Product not in Cart' });
				}

				acc[product.id] = {
					quantity: productIds[product.id],
					price: product.price || -1,
					total: (product.price || -1) * productIds[product.id]
				}

				total += product.price * productIds[product.id];
				return acc
			}, {}
		)

		// Validate shipping fee server-side
		const shopSettings = await directusServer.request(readSingleton('shop_settings', { fields: ['shipping_fees'] })) as { shipping_fees?: ShopSettings['shipping_fees'] };
		const submittedCountry = String(address.country ?? '');
		const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
		const matchingFeeGroup = shopSettings.shipping_fees?.find((group) =>
			group.countries.countryCodes.includes(submittedCountry)
		);
		const matchingThreshold = matchingFeeGroup?.thresholds.find((t) => t.quantity >= totalQuantity);
		const expectedShippingFee = matchingThreshold ? Number(matchingThreshold.fee) : 0;
		const expectedTotal = parseFloat((total + expectedShippingFee).toFixed(2));
		const submittedTotal = parseFloat(checkoutTotal.toFixed(2));
		if (submittedTotal !== expectedTotal) {
			throw createError({ statusCode: 400, statusMessage: `Invalid checkout total. Expected ${expectedTotal}, got ${submittedTotal}.` });
		}

		let uploadedFiles: DirectusFile[] | DirectusFile = []
		//upload files
		if(Object.keys(fileKeys).length > 0) {
			const uploadFormData = new FormData();
			
			for (const key in fileKeys) {
				fileKeys[key].forEach((file) => {
					uploadFormData.append(`metadata`, JSON.stringify({'id' : file.fileId}));
					uploadFormData.append(`folder`, 'b8e9dd11-f7ee-4e11-a166-909bc5247fca');
					uploadFormData.append('file', file.blob, file.filename)
				}
			)	
			}
			uploadedFiles = await directusServer.request<DirectusFile[] | DirectusFile>(withToken(TOKEN, uploadFiles(uploadFormData)));
		}

		let uploadedFileIds: Record<string, string> = {};

		if(uploadedFiles != undefined) {
			if(uploadedFiles instanceof Array) {
				
				uploadedFiles.forEach((file, index) => {
					const serverId = file.metadata?.id;

					if(serverId) {
						uploadedFileIds[serverId] = file.id;
					}
				})

			} else {
				const serverId = uploadedFiles.metadata?.id;

				if(serverId) {
					uploadedFileIds[serverId] = uploadedFiles.id;
				}
				
			}
		}

		//create order items
		const lineItems = orderItems.map<Omit<OrderItem, 'id' | 'order'>>((orderItem) => ({
			product: orderItem.productId,
			product_variant: orderItem.variantId,
			price: ProductsWithPrices[orderItem.variantId].price,
			quantity:ProductsWithPrices[orderItem.variantId].quantity,
			total: ProductsWithPrices[orderItem.variantId].total,
			subtotal: ProductsWithPrices[orderItem.variantId].total,
			submission_values: orderItem.customisationFields?.map((cfield) => {
				if (cfield.type == 'file') {
					const prefix = orderItem.id + '_' + cfield.id + '_';
					const fileIds = [];
					if (cfield.value instanceof Array) {
						cfield.value.forEach((value, index) => {
							const key =  prefix + index;
							if (uploadedFileIds[key]) {
								fileIds.push(
									{
										directus_files_id: uploadedFileIds[key]}
									)
							}
							
						})
					} else {
						const key =  prefix + 0;
						if (uploadedFileIds[key]) {
							fileIds.push(uploadedFileIds[key])
						}
					}
					if(fileIds.length > 0) {
						return {
							fields: cfield.id,
							value: null,
							files: fileIds,
						}
					}
				}else {
					return {
						fields: cfield.id,
						value: cfield.value,
						files: [],
					}
				}
			}) || [],
			addons: orderItem.addons?.map<Omit<OrderItem, 'id' | 'order'>>((addonItem) => ({
				product: addonItem.productId,
				product_variant: addonItem.variantId,
				price: ProductsWithPrices[addonItem.variantId].price,
				quantity:ProductsWithPrices[addonItem.variantId].quantity,
				total: ProductsWithPrices[addonItem.variantId].total,
				subtotal: ProductsWithPrices[addonItem.variantId].total,
			}))
		}))



		for (const field of formData) {
			if (!field || !field.name || field.data == null) continue;
			if (field.name === 'orderId' || field.name === 'fields') continue;

			const matchingField = fields.find((f: { name: string | undefined }) => f.name === field.name);
			if (!matchingField) continue;

			const customerFieldName: string = field.name.replaceAll('-', '_');
			
			if(customerFieldName == 'address') {
				const addressFields = JSON.parse(field.data.toString());

				for (const addressField in addressFields) {
					address[addressField] = addressFields[addressField];
				}
				newCustomer.addresses?.push(address);
			}
			else{
				newCustomer[customerFieldName] = field.data.toString('utf-8');
			}
			
		}

		//check if customer
		const existingCustomer = await directusServer.request(withToken(TOKEN, readItems('customers', {
			fields: ['id',
				{
					'addresses' : [
						'id',
						'street_number',
						'postcode',
						'country',
						'city',

					]
				}
			],
			filter: {
				email: {
					_eq: newCustomer.email
				}
			}
		})));

		
		if(existingCustomer.length < 1) {
			//create new customer
			const createdCustomer = await directusServer.request<Customer>(withToken(TOKEN, createItem('customers', newCustomer)));

			if(createdCustomer) {
				customerId  = createdCustomer.id;
			}
			else {
				throw createError({
					statusCode: 500,
					statusMessage: 'Unable to Create Customer.',
				});
			}

			if(createdCustomer.addresses instanceof Array) {
				addressId = createdCustomer.addresses[0] as string || '';
			}
			else {
				throw createError({
					statusCode: 500,
					statusMessage: 'Customer has no returned address',
				});
			}
		}
		else {
			//get existing customer id.
			customerId  = existingCustomer.length > 0 ? existingCustomer[0]?.id || '' : '';
			address.customer = customerId;
			if (existingCustomer[0].addresses) {

				existingCustomer[0].addresses.forEach((existingAddress) => {
					if(address.postcode && existingAddress.postcode 
						&& address.street_number && existingAddress.street_number) {

						if(address.street_number == existingAddress.street_number &&
							address.postcode == existingAddress.postcode
						) {
							addressId = existingAddress.id;
						}
					}
				})
			}
		}


		const payload = {
			id: orderId,
			customer: customerId,
			status: 'pending' as const,
			fulfillment_status: 'open',
			payment_status: 'awaiting',
			shipping_address: addressId ? addressId : address,
			subtotal: total,
			tax_total: 0,
			shipping_total: checkoutTotal - total,
			total: checkoutTotal,
			line_items: lineItems
		};

		await directusServer.request(withToken(TOKEN, createItem('orders', payload)));

		return { success: true };
	} catch (error) {
		console.log(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
