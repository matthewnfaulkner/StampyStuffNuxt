<script setup lang="ts">
import { type Product } from '~/types';
import { productFields } from '~/types/fields';
import { ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js';
import { CartSlideover } from '#components'

const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const { locale } = useI18n()
const toast = useToast()
const overlay = useOverlay()
const modal = overlay.create(CartSlideover)

async function openModal() {
  modal.open()
}

const cartStore = useCartStore();
const handleAddProductToCart = (product: Product) => {
    const variant = product.variants.find(v => v.id === selectedVariant.value)
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

const slug = computed(() => {
  return Array.isArray(route.params.slug)
    ? route.params.slug[0]
    : route.params.slug
});

// SSR + SSG aware — reruns when locale changes or slug changes
const { data, pending, error } = await useAsyncData(
  () => `products-${slug.value}-${locale.value}`,   // key must include locale
  async () => {
    const products = await $directus.request(
      $readItems('products', {
        filter: { slug: { _eq: slug.value } },
        fields: productFields,
        limit: 1,
      })
    );
    if (!products.length) {
      throw createError({ statusCode: 404, statusMessage: "Not found" });
    }
    const base = products[0];

    if (locale.value === 'en') {
      return base; // default content
    }

    // find translation
    const t = base.translations.find(
      x => x.languages_code === locale.value
    );

    // fallback to default text if translation doesn't exist
    return {
      ...base,
      title: t?.title ?? base.title,
      content: t?.content ?? base.content
    };
  },
  {
    watch: [() => locale.value, () => slug.value], // react to locale changes
  }
);

const product = computed(() => data.value);

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
  return selected || ''
})

const isDisabled = computed(() => !selectedVariant.value)

const images = computed(() => {

  const productImages =
    product.value.images?.map(v => v.file.filename_disk).filter(Boolean) || []
  
  const variantImages =
    product.value.variants?.map(v => v.image.filename_disk).filter(Boolean) || []

  return [...productImages, ...variantImages]
})



const counter = ref(1);

const carousel = useTemplateRef('carousel')
const activeIndex = ref(0)

function onClickPrev() {
  activeIndex.value--
}
function onClickNext() {
  activeIndex.value++
}
function onSelect(index: number) {
  activeIndex.value = index
}

function select(index: number) {
  activeIndex.value = index

  carousel.value?.emblaApi?.scrollTo(index)
}
</script>

<template>
  
  <UPageHero 
    v-if="product"
    :title="product.title"
    class="justify-center max-w-xs sm:max-w-none"
    orientation="horizontal"
    :ui="{
      title: 'font-headers'
    }"
    reverse>
    <template #default>
      <div>  
        <UCarousel
            ref="carousel"
            v-slot="{ item }"
            :items="images"
            :prev="{ onClick: onClickPrev }"
            :next="{ onClick: onClickNext }"
            class="w-full w-100 mx-auto"
            @select="onSelect"
          >
          <img :src="`${$directus.url}assets/${item}?width=600`" width="" height="" class="rounded-lg max-w-full">
    </UCarousel>

    <div class="flex gap-1 justify-center pt-4 max-w-xs mx-auto">
      <div
        v-for="(item, index) in images"
        :key="index"
        class="size-11 opacity-25 hover:opacity-100 transition-opacity"
        :class="{ 'opacity-100': activeIndex === index }"
        @click="select(index)"
      >
        <img :src="`${$directus.url}assets/${item}?width=600`" width="44" height="44" class="rounded-lg">
      </div>
    </div>
      </div>  
    </template>


      
    <template #description>
        <div v-html="product.description"></div>
    </template>
    <template #body>
      <UPageCard
        title="Choose an option"
        class="lg:w-xl m-auto w-full">
        <template #header>
            <div v-html="variantDescription.description"></div>
            <div>RM {{ variantDescription.price}}</div>
        </template>
        <URadioGroup 
            v-model="selectedVariant"
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
      <div class="row">
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
     </UPageCard>
    </template>
  </UPageHero>
</template>
