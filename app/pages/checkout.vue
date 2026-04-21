<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '~/stores/cartStore';
import ProductCard from '~/components/Cart/ProductCard.vue';
import { formFields } from '~/types/fields';
import type FormBlockVue from '~/components/block/FormBlock.vue';
import { BlockFormBlock, FormField } from '#components';
import Headline from '~/components/base/Headline.vue';
import Tagline from '~/components/base/Tagline.vue';
import FormBuilder from '~/components/forms/FormBuilder.vue';


const { $directus, $readFieldsByCollection, $readItems } = useNuxtApp()

const { locale } = useI18n()

const cartStore = useCartStore()

const shopSettingsStore = useShopSettingsStore();

const shopSettings = shopSettingsStore.getShopSettings() as ShopSettings;


const { data, error } = await useAsyncData('post', async () => {

    const forms = await $directus.request($readItems('forms', {

        fields: formFields as any,
        filter: {
          title: {
            _eq: 'Checkout'
          }  
        },
        limit: 1
    }))
    if (!forms.length) {
      throw createError({ statusCode: 404, statusMessage: "Not found" });
    }

    const baseCheckoutForm = forms[0];
    
    const productFields = cartStore.cart.flatMap(field => field.product_fields);
    
    const extraCheckoutFields = productFields.flatMap(field => toRaw(field?.product_fields_id) ?? []);

    /*const orderItemFields: FormField[] = cartStore.cart.map(item => ({
        id: item.id,
        name: item.product.slug,           // pick a property name from item
        value: item.quantity.toString(),
        type: 'hidden'
    }));*/

    // Increment the `sort` property of each field by x
    const x = baseCheckoutForm.fields.length;

    extraCheckoutFields.forEach(f => {
        f.sort = (f.sort ?? 0) + x;  // handles undefined sort
    });


    baseCheckoutForm.fields.push(...extraCheckoutFields);
    return baseCheckoutForm;
})

const form = computed(() => data.value);

const cartHasProducts = computed(() => (cartStore?.cart?.length ?? 0) > 0)

const shipping_fees = shopSettings.shipping_fees

const shippingCountry = ref('')

const shipping_fee = computed<number>(() => {
    const country_fees = shipping_fees?.find((fee) => 
        fee.countries.countryCodes.find(
            (code) => code == shippingCountry.value)
    )

    if(!country_fees) return 0;

    const country_fee = country_fees.thresholds.find((threshold) => threshold.quantity >= cartStore.totalCartProducts);

    if(!country_fee) return 0;

    return Number(country_fee.fee);

})

const checkout_total = computed(() => {
    return +cartStore.totalProductsPrice + +shipping_fee.value;
})

</script>

<template>
    <UPageSection>
        <UPage>
            <UPageColumns
                class="grid sm:grid-cols-2 lg:grid-cols-2 gap-4"
                >  

                <div>
                    <BaseHeadline headline="Your Basket" class="mb-10" />
                    <div v-if="!cartHasProducts">Your cart is empty</div> 
                    <div v-else v-for="cartProduct in cartStore.cart ?? []" :key="cartProduct.id">
                        <ProductCard
                            :id="cartProduct.id"
                            :price="cartProduct.price"
                            :product="cartProduct.product"
                            :size="cartProduct.size"
                            :image="cartProduct.image"
                            :addons="cartProduct.addons"
                            :is-custom="cartProduct.isCustom"
                        />
                    </div>
                    <div class="mt-2 space-y-4 text-white">
                        <div class="font-Roboto">
                            <div class="flex items-center justify-between py-2 font-bold text-black dark:text-white border-b">
                                <h1>Shipping</h1>
                                <h4 v-if="!shippingCountry" class="text-base text-gray-500 dark-text-gray-300">Enter your Address</h4>
                                <h4 v-else class="text-base text-gray-500 dark-text-gray-300">RM {{ shipping_fee.toFixed(2) }}</h4>
                            </div>
                            <div class="flex items-center justify-between py-2 font-bold text-black dark:text-white border-b">
                                <h1>Total</h1>
                                <h1 class="font-bold text-black dark:text-white">RM {{ checkout_total.toFixed(2) }}</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div >
                    <div
                        class="bg-primary dark:bg-secondary-950">
                        <UPageCard
                            title="Checkout"
                            description=""
                            class="mb-3"
                        >
                        </UPageCard>
                            
                        <div v-if="shopSettings?.enabled">
                            <CheckoutBuilder v-if="cartHasProducts" :form="form" :checkout-total="checkout_total" @address-country-change="shippingCountry = $event"></CheckoutBuilder>
                        </div>
                        <div v-else >
                           
                            <FormBuilder  :form="shopSettings.reminder_form" > 
                                <template #title>
                                    <BaseText :content="shopSettings.shop_closed_message || ''" />
                                </template>
                            </FormBuilder>
                        </div>
                    </div>
                </div>
            </UPageColumns>
    </UPage>
</UPageSection>
    
</template>