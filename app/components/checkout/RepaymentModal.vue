<script setup lang="ts" >


const props = defineProps<{
    paymentIntent: string,
}>();

const paymentEl = ref(null);

const { onLoaded } = useScriptStripe()
const stripe = ref()
const elements = ref(null)
const config = useRuntimeConfig();
const intentAmount = ref();
const intentCurrency = ref();
const paymentIntent = props.paymentIntent;

const { data: currencies, status, execute } = await useLazyFetch<
  Record<string, {
    symbol: string
    name: string
    code: string
  }>
>('/api/currencies.json', {
  immediate: false
})

onMounted(() => {
  onLoaded(async ({ Stripe }) => {
    // 1. Create Stripe instance
    stripe.value = Stripe(config.public.stripePublicKey)

    if (!stripe.value || !paymentIntent) return

    // 2. Get clientSecret from your backend
    const { clientSecret, amount, currency } = await $fetch('/api/stripe/get-payment-intent', {
                method: 'POST',
                query: { paymentIntent: paymentIntent }
            });
    
    await execute();

    // 3. Create Elements
    elements.value = stripe.value.elements({
        clientSecret
    })

    intentAmount.value = (amount / 100).toFixed(2);
    intentCurrency.value = currency.toUpperCase();
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

const selectedCurrency = computed(() =>
        currencies.value?.[intentCurrency.value]
)


const error = ref();

const handleSubmit = async (data: Record<string, any>) => {

	error.value = null;

	if (!stripe.value || !paymentEl.value) return
	
	if(isComplete.value !== true) {
		paymentErrors.value = true
		return;
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

</script>
<template>
    <UModal 
        title="Retrying Payment..."
        :ui="{
            body: 'flex flex-col text-center'
        }">
        <template #body>
            {{ selectedCurrency?.symbol }} {{  intentAmount }}
            <form  @submit.prevent="handleSubmit" >
                <div ref="paymentEl" class="w-full p-5" :class="{
                    'border-2 border-error rounded-lg': paymentErrors && !isComplete
                    }"> 
                </div>
                <div v-if="paymentErrors && !isComplete" class="text-error">
				Please Enter Your Payment Details
			    </div>
                <UButton type="submit" label="Pay" variant="solid" color="secondary" class="m-auto mt-2"/>
            </form>           	
        </template> 
        
    </UModal>
</template>