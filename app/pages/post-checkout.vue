<script lang="ts" setup>
import { CheckoutRepaymentModal } from '#components';

const route = useRoute();
const cartStore = useCartStore()
const overlay = useOverlay();
const params = route.query;
const paymentIntent = params.payment_intent;
const repaymentModal = overlay.create(CheckoutRepaymentModal)

const shopSettingsStore = useShopSettingsStore();
const shopSettings = shopSettingsStore.getShopSettings() as ShopSettings;

type status = 'succeeded' | 'failed'

const paymentEl = ref(null);

const { onLoaded } = useScriptStripe()
const stripe = ref()


const config = useRuntimeConfig();
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

    
   
  })

})


const redirectStatus = params.redirect_status as status;


if(redirectStatus == 'failed') {

}

const error = ref();

cartStore.refreshCart();

</script>

<template>

    <UPageSection class="flex justify-center text-center">
        <div v-if="redirectStatus == 'succeeded'">
            <BaseHeadline :headline="shopSettings?.payment_success_heading" class="m-auto"/>
            <BaseText class="text-sm/10 w-80 m-auto" :content="shopSettings?.payment_success_message || ''"></BaseText>

        </div>
        <div v-else-if="redirectStatus =='failed'">
            <BaseHeadline :headline="shopSettings?.payment_failed_heading" class="m-auto"/>
            <BaseTagline tagline="We weren't able to process your payment." class="m-auto my-10"/>
            <BaseText class="text-sm/10 w-80 m-auto" :content="shopSettings?.payment_failed_message || ''"></BaseText>
            <UButton label="Retry Payment" @click="() => {repaymentModal.open({paymentIntent: paymentIntent as string})}" variant="solid" size="xl" color="secondary" class="m-auto mt-5"/>
        </div>
        
        <div v-else>
            <BaseHeadline headline="Somethings Gone Wrong" class="m-auto text-cente"/>
            <BaseTagline tagline="You're not supposed to see this!" class="m-auto mt-10"/>
            
        </div>
        <UButton label="Back To Home" to="/" variant="outline" size="xl" color="secondary" class="m-auto"/>
    </UPageSection>

</template>