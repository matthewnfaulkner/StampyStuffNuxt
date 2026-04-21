<script setup lang="ts">
import DynamicForm from '../forms/DynamicForm.vue';
import type { FormField } from '@@/shared/types/schema';
import { generateUid } from '@directus/sdk';
import { CheckCircle } from 'lucide-vue-next';
import { ref } from 'vue'
import { useFileStorage } from '~/composables/useFileStorage.client';
import { type CartOrderItem, type CustomisationFile, type CustomisationField } from '#shared/types/checkoutTypes'

const config = useRuntimeConfig();
const cartStore = useCartStore()
const { getAllFiles } = useFileStorage();

interface CustomFormData {
	id: string;
	on_success?: 'redirect' | 'message' | null;
	sort?: number | null;
	submit_label?: string | null;
	success_message?: string | null;
	title?: string | null;
	success_redirect_url?: string | null;
	is_active?: boolean | null;
	fields: FormField[];
}

const props = defineProps<{
	form: CustomFormData;
	className?: string;
	checkoutTotal?: number;
}>();

const isSubmitted = ref(false);
const error = ref<string | null>(null);
const orderId = cartStore.cartId;

const paymentEl = ref(null);

const { onLoaded } = useScriptStripe()
const stripe = ref()
const elements = ref(null)
onMounted(() => {
  onLoaded(async ({ Stripe }) => {
    // 1. Create Stripe instance
    stripe.value = Stripe(config.public.stripePublicKey)

   if (!stripe.value || !paymentEl.value) return

    // 2. Get clientSecret from your backend
   const { clientSecret } = await $fetch('/api/stripe/create-payment-intent', {
			method: 'POST',
			query: {
				cart: JSON.stringify(cartStore.cart),
				orderId: orderId
			}
		});

    // 3. Create Elements
    elements.value = stripe.value.elements({
      clientSecret
    })


    // 4. Create Payment Element
    const paymentElement = elements.value.create('payment')

    // 5. Mount it
    paymentElement.mount(paymentEl.value)

	paymentElement.on('change', (event) => {
		isComplete.value = event.complete
		})
  })

})

const isComplete = ref(false)
const paymentErrors = ref(false);

const emit = defineEmits<{ 'address-country-change': [country: string] }>();




const handleSubmit = async (data: Record<string, any>) => {

	error.value = null;

	if (!stripe.value || !paymentEl.value) return
	
	if(isComplete.value !== true) {
		paymentErrors.value = true
		return;
	}

	try {

		const cart = cartStore.cart;

		const allFiles = await getAllFiles();
		const filesToUpload: CustomisationFile[] = []

		//parse cart items ready to make order.
		const orderItems: CartOrderItem[] =  cart.map<CartOrderItem>((cartItem) => (
			{
				id: cartItem.id,
				productId: cartItem.product.id,
				variantId: cartItem.variantId,
				quantity: cartItem.quantity,
				isCustom: cartItem.isCustom,
				addons: cartItem.addons?.map((addonItem) => ({
					productId: addonItem.product.id,
					variantId: addonItem.id,
					quantity: addonItem.quantity,
				})) || [],
				customisationFields: cartItem.customisationFields?.fields?.map((field) => {
					if (field.type == 'file') {
						const retrievedFiles: File[] = [];
						if (field.value instanceof Array) {
							field.value.forEach((filename) => {
								const file = allFiles.find((storedFiles) => storedFiles.name == filename)
								if (file instanceof File) {
									filesToUpload.push({
										itemId: cartItem.id,
										fieldId: field.id,
										file: file
								})
								}
							})
						}
					} 
					return field;
				}) as CustomisationField[]
			}
		))
		
		const fieldsWithNames = props.form.fields.map((field) => ({
			id: field.id,
			name: field.name || '',
			type: field.type || '',
		}));
		const formData = new FormData();
		formData.append('orderId', orderId);
		formData.append('fields', JSON.stringify(fieldsWithNames));
		formData.append('orderItems', JSON.stringify(orderItems));
		formData.append('checkoutTotal', (props.checkoutTotal ?? 0).toString());
		
		for (const key in filesToUpload) {
			if( filesToUpload[key]?.file instanceof File ) {
				formData.append(filesToUpload[key]?.itemId + '_' + filesToUpload[key]?.fieldId + '_' + key, filesToUpload[key]?.file);
			}
		}
		for (const key in data) {
			if (data[key] instanceof File) {
				formData.append(key, data[key]);
			} else {
				if (key == 'address') {
					data[key].country = JSON.stringify({
						countryCodes: [data[key].country]
					});
					formData.append(key, JSON.stringify(data[key] || ''));
				}
				else {
					formData.append(key, data[key]?.toString() || '');
				}
				
			}
		}

		await $fetch('/api/orders/submit', {
			method: 'POST',
			body: formData,
		});
		//await submitCheckout(formData);

		if (props.form.on_success === 'redirect' && props.form.success_redirect_url) {
			window.location.href = props.form.success_redirect_url;
		} else {
			isSubmitted.value = true;
		}

	} catch (submitError) {
		console.log(submitError)
		error.value = 'Failed to submit the Order. Please try again later.';
	}

	try {
		const { 
			paymentError
		} = await stripe.value.confirmPayment({
			elements: elements.value,
			confirmParams: {
				return_url: `${config.public.siteUrl}/post-checkout`
		
		}})
	}
	catch (submitError) {
		console.log(submitError)
		error.value = 'Failed to complete Payment';
	}
};

const initialValues = {
	'first-name': 'John',
	'last-name': 'Smith',
	email: 'john@john.com',
	phone: '+600108202573',
	'address': {
		'street-number' : '7',
		'address-line-1': 'Jalan Limau Kasturi',
		'address-line-2' : 'Bangsar',
		'city' : 'Kuala Lumpur',
		'state' : 'Kuala Lumpur',
		'postcode' : '59000',
		'country' : 'MY'
	}
}

</script>

<template>
	
	<div v-if="form.is_active" :class="['space-y-6 border border-input p-8 rounded-lg', className]">
		<div v-if="error" class="p-4 text-red-500 bg-red-100 rounded-md">
			<strong>Error:</strong>
			{{ error }}
		</div>
		<div v-if="isSubmitted" class="flex flex-col items-center justify-center space-y-4 p-6 text-center" v>
			<CheckCircle className="size-12 text-green-500" />
			<p class="text-gray-600">
				{{ form.success_message || 'Your form has been submitted successfully.' }}
			</p>
		</div>
		
		<DynamicForm
			:fields="form.fields"
			:onSubmit="handleSubmit"
			:submitLabel="form.submit_label || 'Complete Purchase'"
			:formId="form.id"
			@address-country-change="emit('address-country-change', $event)"
		>
		<template #stripe>
			<div ref="paymentEl" class="w-full p-5" :class="{
				'border-2 border-error rounded-lg': paymentErrors && !isComplete
				}">	
			
		</div>
		<div v-if="paymentErrors && !isComplete" class="text-error">
				Please Enter Your Payment Details
			</div>
		</template>
	
		</DynamicForm>

	</div>	
</template>
