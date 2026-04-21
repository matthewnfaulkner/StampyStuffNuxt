<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js';
import { CartSlideover } from '#components'
import type DirectusImageVue from '~/components/shared/DirectusImage.vue';
import type FormBuilderVue from '~/components/forms/FormBuilder.vue';
import ProductCard from '@/components/Cart/ProductCard.vue';
import type FormBlockVue from '~/components/block/FormBlock.vue';
import { Key } from 'lucide-vue-next';

const toast = useToast()
const overlay = useOverlay()
const modal = overlay.create(CartSlideover)
const route = useRoute()
const router = useRouter();
const cartStore = useCartStore();
const customisationStore = useCustomisationStore();

interface CustomFormData {
	id: string;
	tagline: string | null;
	headline: string | null;
	form: CustomForm;
}

interface CustomForm {
	id: string;
	on_success?: 'redirect' | 'message' | null;
	sort?: number | null;
	submit_label?: string | null;
	success_message?: string | null;
	title?: string | null;
	success_redirect_url?: string | null;
	is_active?: boolean | null;
	fields: ProductField[];
}


const selectedVariantId = route.query.variantId;
const editing = route.query.editing;
const path = route.path;
const slug = path.split('/')[2];

if (!selectedVariantId === undefined && !editing === undefined) {
	throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true });
}

if (!slug === undefined) {
	throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true });
}


const handleAddProductToCart = () => {
    const variant = selectedVariant.value as CartItem;

    variant.addons = [];
    variant.quantity = counter.value;
    if (variant === undefined){
      return;
    }
  

    for (const addonId in selectedAddonVariants.value) {
      const selectedAddon = addons?.find((addon) => addon.id == addonId);
      const selectedAddonVariant = selectedAddon.variants?.find((variant: Product) => variant.id == selectedAddonVariants.value[addonId]);
      if ( selectedAddonVariant) {
        const {variants, ...productWithoutVariants} =  selectedAddon;
        selectedAddonVariant.variantId = selectedAddonVariant.id;
        selectedAddonVariant.product = productWithoutVariants;
        variant.addons.push({...selectedAddonVariant, quantity: 1});
      }
    }
    
    variant.customisationFields = customisationStore.items[selectedVariant.value?.id];
    variant.isCustom = true;
    const {variants, ...productWithoutVariants} =  product.value;
    variant.product = productWithoutVariants;

    if(editing){
      cartStore.updateProductInCart(selectedVariant.value?.id, selectedVariant.value);
    }
    else{
       variant.variantId = variant.id;
       variant.id = crypto.randomUUID();
       cartStore.addProductToCart(variant, counter.value);
    }
   


    customisationStore.clearItem(selectedVariantId);
    navigateTo(`/shop/${slug}/success`);
    toast.add({

      title: `${counter.value} x ${product.value?.title} - ${variant.size} added to Cart`,
      color: 'success', // Optional: 'success', 'error', 'info', 'warning'
      icon: 'i-heroicons-check-circle', // Optional: use any Heroicons icon
      orientation: 'horizontal',
      class: 'bg-secondary text-white',
      ui: {
        title: 'text-white',
        icon: 'text-white',
        close: 'text-white'
        
      },
      actions: [{
        icon: 'i-lucide-shopping-cart',
        label: 'Cart',
        color: 'primary',
        variant: 'solid',
        ui: {
          label: 'text-black dark:text-black',
          leadingIcon: 'text-black'
        },
        onClick: (e) => {
          const modal = overlay.create(CartSlideover)
          modal.open()
        }
      }]
    })
}


const {
	data,
  pending,
	error,
	refresh,
} = await useFetch<{product: Product}>(`/api/products/${slug}`, {
	key: `products-${slug}`,
  query: {slug: slug}
});

if (!data.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true });
}

const product = computed(() => data.value?.product);
// 🔍 Watch whenever radio changes

if (!product.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true });
}

const variants = product.value?.variants || []


const selectedVariant = computed(() => {
  if(editing) {
    return cartStore.cart.find((item) => item.id == editing);
  }
  return variants.find(v => v.id === selectedVariantId)
});

const addons = product.value?.addons?.flatMap(field => field.related_products_id)

const counter = ref(1);


const selectedAddonVariants = ref<Record<string, string>>();

if(editing) {
    selectedAddonVariants.value = Object.fromEntries(
      (selectedVariant.value?.addons ?? []).map(addon => [addon.product.id, addon.id])
    )
} 
else {selectedAddonVariants.value = Object.fromEntries(
    (addons ?? []).map(addon => [addon.id, '0'])
  )
}

const addonDescriptions = computed(() => {
    const selected = addons?.map((addon, index) => addon?.variants?.find(v => v.id === selectedAddonVariants.value[index])?.description);
    return selected;
})


const noAddon = {
    id: '0',
    size: "Don't Add"
}

const images = computed(() => {
  if (!addons) return [];

  return addons.map(addon => {
        if (!addon) return [];
        const addonImages =
            addon.images?.map(img => img.file).filter(Boolean) || [];

        const variantImages =
            addon.variants?.map(v => v.image).filter(Boolean) || [];

        return [addon.thumbnail, ...addonImages, ...variantImages];
  });
});

</script>

<template>
  <UPageSection
      title="Choose Add-Ons"
      class="lg:my-20"
      :ui="{
        title: 'font-header text-secondary',
        container: 'py-0 sm:py-0 md:py-0 lg:py-0 md:max-w-200'
    }
    ">
    <UPageCard :title="product?.title" :description="selectedVariant?.size || ''" orientation="horizontal">
        <div>
          RM {{ selectedVariant?.price}}
        </div>

    </UPageCard>
    
      <UPageCard
        v-for="(addon, index) in addons"
        :title="addon?.title"
        orientation="horizontal"
        class=" m-auto sm:min-w-lg w-full  xl:min-w-xl"
        :ui="{
          container: 'w-full'
        }">
        <template #header>
            <UBadge color="info">Add-On {{ index + 1}}</UBadge>
        </template>
        <template #title>
            <BaseTagline :tagline="addon?.title" />
        </template>
                <template #description>
            <BaseText :content="addon?.description || ''" />
            <div v-if="addonDescriptions" v-html="addonDescriptions[index]" />
        </template>
        <URadioGroup 
            v-if="addon?.variants"
            v-model="selectedAddonVariants[addon.id]"
            size="xs"
            legend="Select a Variation"
            indicator="end" 
            orientation="vertical"
            color="neutral"
            variant="card" 
            :items="[noAddon, ...addon?.variants]" 
            class="w-full lg:w-full"
            value-key="id"
            label-key="size"
            description-key="price"
            :ui="{
            fieldset: 'flex flex-wrap',
            item: 'bg-none text-black border-secondary text-black dark:text-black has-data-[state=checked]:bg-white dark:has-data-[state=checked]:bg-info-800',  

            }">  
            <template #label="{item}">
                {{ item.color }} {{ item.size }}
            </template>
            <template #description={item}>
                <div v-if="item.price > 0"> + RM {{ item.price }} </div>
            </template>
        </URadioGroup>
        <ProductImageGallery :data="images[index]" class="w-full"/>
     </UPageCard>
     <div class="flex flex-row justify-center w-100 m-auto">
      <UButton 
        label="Back" 
        variant="outline" 
        color="neutral" 
        class="m-auto" 
        size="xl" 
        :to="`customise?variantId=${selectedVariant?.id}`">
      </UButton>
      <UButton 
        :label="editing?  'Update Item' : 'Add to Cart'" 
        variant="solid" 
        color="secondary" 
        class="m-auto" 
        icon="i-lucide-shopping-cart" 
        size="xl"
        @click="handleAddProductToCart"
        ></UButton>
     </div>
     
  </UPageSection>
  
</template>
