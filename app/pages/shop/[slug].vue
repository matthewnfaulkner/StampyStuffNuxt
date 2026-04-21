<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js';
import { CartSlideover } from '#components'

const route = useRoute()
const { locale } = useI18n()
const toast = useToast()
const overlay = useOverlay()
const pageUrl = useRequestURL();

const cartStore = useCartStore();
const handleAddProductToCart = (product: Product) => {
    const variant = product?.variants?.find(v => v.id === selectedVariant.value) as CartItem
    const {variants, ...productWithoutVariants} =  product;
    variant.product = productWithoutVariants;
    variant.variantId = variant?.id;
    if (variant === undefined){
      return;
    }
    cartStore.addProductToCart(variant, counter.value);
    toast.add({

      title: `${counter.value} x ${product.title} - ${variant.size} added to Cart`,
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

const slug = route.params.slug as string;

// SSR + SSG aware — reruns when locale changes or slug changes

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
	throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true });
}

const product = computed(() => data.value?.product);


// 🔍 Watch whenever radio changes
const selectedVariant = ref(null)
watch(
  () => product.value?.variants,
  (variants) => {
    if (!Array.isArray(variants) || !variants.length) return
    // Check route param first
    const routeVariant = route.query.variant

    if (routeVariant) {
      const match = variants.find(v => String(v.id) === String(routeVariant))
      if (match) {
        selectedVariant.value = match.id
        return
      }
    }

    // Otherwise default to first
    if (!selectedVariant.value) {
      selectedVariant.value = variants[0].id
    }
  },
  { immediate: true }
)

const variantDescription = computed(() => {
  const variants = product.value?.variants || []
  const selected = variants.find(v => v.id === selectedVariant.value)
  return selected;
})

const isDisabled = computed(() => !selectedVariant.value)

const images = computed(() => {
  if (product.value !== undefined) {

    const productImages =
      product.value.images?.map(v => v.file).filter(Boolean) || []
    
    const variantImages =
      product.value.variants?.map(v => v.image).filter(Boolean) || []

    return [...productImages, ...variantImages]
  }

  return [];
}) 


useSeoMeta({
	title: product.value?.title || product.value?.title || '',
	description: product.value?.description || '',
	ogTitle: product.value?.title || product.value?.title || '',
	ogDescription: product.value?.description || '',
	ogUrl: pageUrl.toString(),
});

const counter = ref(1);

</script>

<template>

  <UPageSection
      class="lg:my-20"
      :ui="{
        title: 'font-header text-secondary',
        container: 'py-0 sm:py-0 md:py-0 lg:py-0'
    }
    ">
  <UPageHero 
    v-if="product"
    :title="product.title"
    class="justify-center max-w-md sm:max-w-xl md:max-w-xl lg:max-w-none pt-0"
    orientation="horizontal"
    :ui="{
      title: 'font-header',
      container: 'flex flex-col lg:grid py-0 sm:py-0 lg:py-0 gap-4 lg:gap-16 font-mono'
    }"
    reverse>
    
    <template #default>
      <ProductImageGallery :data="images" />
    </template>

    <template #headline>
              <UBadge v-if="product.is_custom" color="info" variant="solid" label="This is a custom stamp"></UBadge>
    </template>
      
    <template #description>
        <div v-html="product.description"></div>
    </template>
    <template #body>
      
      <UPageCard
        title="Choose an option"
        class=" m-auto w-fit sm:min-w-lg md:min-w-md xl:min-w-xl"
        :ui="{
          container: 'w-fit'
        }">
        <template #header>
            <div v-html="variantDescription.description"></div>
            <div class="text-2xl font-bold font-header">RM {{ variantDescription.price}}</div>
        </template>
        <URadioGroup 
            v-if="product.variants"
            v-model="selectedVariant"
            size="xs"
            indicator="end" 
            orientation="horizontal"
            color="secondary"
            variant="card" 
            :items="product.variants" 
            class="w-full lg:w-full"
            value-key="id"
            label-key="size"
            description-key=""
            :ui="{
              fieldset: 'flex flex-wrap',
              item: 'bg-secondary-700 text-white',  
              label: 'text-white',
              description: 'text-white'
            }">  
        </URadioGroup>
      <div v-if="!product.is_custom" class="row">
        <UInputNumber 
              v-model="counter" 
              :min=0
              :max=10
              variant="outline" 
              color="neutral" 
              size="xl"
              :disabled="isDisabled"
              class="mx-3 max-w-30"
              :increment="{
                color: 'secondary',
                variant: 'solid',
                size: 'xs'
              }"
              :decrement="{
                color: 'secondary',
                variant: 'solid',
                size: 'xs'
              }"/>
        <UButton label="Add to Cart" color="secondary" variant="solid" @click="handleAddProductToCart(product)" :disabled="isDisabled">
        </UButton>
      </div>
      <div v-else class="flex justify-left">
        <UButton label="Personalise my stamp!" size="xl" color="tertiary" variant="solid"   
          :to="{
            path: `/shop/${slug}/customise`,
            query: {
              variantId: selectedVariant,
            }
          }" 
          class="bg-tertiary dark:bg-tertiary-100 dark:hover:bg-tertiary-300"
          :disabled="isDisabled">
        </UButton>
      </div>
     </UPageCard>
    </template>
  </UPageHero>
  </UPageSection>
</template>
