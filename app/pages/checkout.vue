<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '~/stores/cartStore';
import ProductCard from '~/components/Cart/ProductCard.vue';
import { formFields } from '~/types/fields';
import type FormBlockVue from '~/components/block/FormBlock.vue';
import { BlockFormBlock, FormField } from '#components';


const { $directus, $readFieldsByCollection, $readItems } = useNuxtApp()

const { locale } = useI18n()
const route = useRoute();
const cartStore = useCartStore()

const cartLabel = computed(() => 
  cartStore.totalCartProducts.toString()
)


const { data, error } = await useAsyncData('post', async () => {

    const forms = await $directus.request($readItems('forms', {

        fields: formFields,
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

    const orderItemFields: FormField[] = cartStore.cart.map(item => ({
        id: item.id,
        name: item.size,           // pick a property name from item
        value: item.quantity,
        type: 'hidden'
    }));

    // Increment the `sort` property of each field by x
    const x = baseCheckoutForm.fields.length;
    console.log(x);
    extraCheckoutFields.forEach(f => {
        f.sort = (f.sort ?? 0) + x;  // handles undefined sort
    });


    baseCheckoutForm.fields.push(...extraCheckoutFields, ...orderItemFields);
    return baseCheckoutForm;
})

const form = computed(() => data.value);

const cartHasProducts = computed(() => (cartStore?.cart?.length ?? 0) > 0)

interface ContactLinks {
  whatsapp: string;
  email: string;
}

// Reactive computed links
const contactLinks = computed(() => {
  const cart = cartStore.cart;
  const totalPrice = cartStore.totalProductsPrice;

  if (cart.length === 0) {
    return { whatsapp: '', email: '' };
  }

  // Build product list
  const productListText = cart.map((p) => `${p.product.title} - ${p.size} - x ${p.quantity}`).join('\n');
  const productListWhatsApp = cart.map((p) => `${p.product.title} - ${p.size} - x ${p.quantity}`).join('%0A');

  // First product image (email only)
  const firstImage = cart[0]?.image
    ? `<br><img src="${cart[0].image}" alt="${cart[0].product.title}" width="200"/>`
    : '';

  // Message templates
  const messageText = `Hi, I'm interested in the following item(s):\n${productListText}\n\nTotal: RM ${totalPrice}`;
  const messageWhatsApp = `Hi, I'm interested in the following item(s):%0A${productListWhatsApp}%0A%0ATotal: RM ${totalPrice}`;

  // WhatsApp link
  const businessNumber = '601113020294'; // your number
  const whatsappLink = `https://wa.me/${businessNumber}?text=${messageWhatsApp}`;

  // Email link
  const emailRecipient = 'nicky@stampystuff.my';
  const emailSubject = encodeURIComponent('Product Inquiry');
  const emailBody = encodeURIComponent(`${messageText}${firstImage}`);
  const emailLink = `mailto:${emailRecipient}?subject=${emailSubject}&body=${emailBody}`;

  return { whatsapp: whatsappLink, email: emailLink };
});
</script>

<template>
    <UPageSection>
        <UPage>
            
            <UPageColumns
                class="grid sm:grid-cols-2 lg:grid-cols-2 gap-4"
                >  
                <div class="">
                    <div v-if="!cartHasProducts">Your cart is empty</div> 
                    <div v-else v-for="cartProduct in cartStore.cart ?? []" :key="cartProduct.id">
                        <ProductCard
                            :id="cartProduct.id"
                            :price="cartProduct.price"
                            :product="cartProduct.product"
                            :size="cartProduct.size"
                            :image="cartProduct.image"
                        />
                    </div>
                    <div class="mt-2 space-y-4 text-white">
                        <div class="font-Roboto">
                            <div class="flex items-center justify-between py-2 font-bold text-black dark:text-white border-b">
                                <h1>Shipping</h1>
                                <h4 class="text-base text-gray-500 dark-text-gray-300">Calculated at checkout</h4>
                            </div>
                            <div class="flex items-center justify-between py-2 font-bold text-black dark:text-white border-b">
                                <h1>Total</h1>
                                <h1 class="font-bold text-black dark:text-white">RM {{ cartStore.totalProductsPrice }}</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="">
                    <div
                        class="bg-primary dark:bg-secondary-950">
                        <UPageCard
                            title="Checkout"
                            description="Oops, our checkout systems not active yet. Don't worry we can still process your order via
                                WhatsApp or Email."
                        ><span class="justify-between xl:flex space-y-5 xl:space-y-0">
                          <UButton :href="contactLinks.whatsapp" target="self" icon="i-simple-icons-whatsapp" size="xl" label="Checkout using WhatsApp" color="secondary" variant="solid" />
                          <UButton :href="contactLinks.email"
                            icon="i-simple-icons-gmail" size="xl" label="Checkout using e-mail" color="secondary" variant="solid" />
                            </span>
                        </UPageCard>
                            

                            <!--<CheckoutBuilder :form="form"></CheckoutBuilder>-->
                    </div>
                </div>
            </UPageColumns>
    </UPage>
</UPageSection>
    
</template>