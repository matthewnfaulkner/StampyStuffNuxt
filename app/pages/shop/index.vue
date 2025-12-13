<script setup lang="ts">

import { productVariantFields } from '~/types/fields';

const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const page: Ref<Page | null> = ref(null)
const pageUrl = useRequestURL();

const { locale } = useI18n()
const toast = useToast()
const overlay = useOverlay()

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
      $readItems('product_variants', {
        fields: productVariantFields,
        limit: 1,
      })
    );
    if (!products.length) {
      throw createError({ statusCode: 404, statusMessage: "Not found" });
    }

    const base = products;

    if (locale.value === 'en') {
      return base; // default content
    }

  },
  {
    watch: [() => locale.value, () => slug.value], // react to locale changes
  }
);

useSeoMeta({
	title: page.value?.seo?.title || page.value?.title || '',
	description: page.value?.seo?.meta_description || '',
	ogTitle: page.value?.seo?.title || page.value?.title || '',
	ogDescription: page.value?.seo?.meta_description || '',
	ogUrl: pageUrl.toString(),
});

const products = computed(() => data.value);

</script>

<template>
<UPageSection
    title="Stampy Shop"
    :ui="{
        title: 'font-header text-secondary'
    }
    ">
  <UPageGrid class="lg:mx-30">
    <UPageCard
      v-for="(product, index) in products"
      :key="index"
      variant="solid"
      :to="`/shop/${ product.product.slug }?variant=${ product.id }`"
      :class="[
        'transition-all duration-300 rounded-2xl hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-secondary-100',
        ]"
      class="h-full rounded-none bg-primary dark:bg-secondary-950 ring-secondary-600 ring hover:bg-primary dark:hover:bg-secondary-950"
      :ui="{
        title: 'text-center',
        body: 'items-center ring-secondary-600',
        root: 'ring-secondary-600 text-secondary dark:text-primary'
       }"
    >
      <template #default> 
        <div v-for="(product_field) in product.product_fields">
          {{ product_field }}
        </div>
              <SharedDirectusImage :uuid = product.image />
              <div class="text-xl">{{ product.product.title }}</div>
              <div v-html="product.size"></div>
              <div class="text-right">RM {{ product.price }}</div>
              <div>{{ product.product.category }}</div>
      </template>
      <template #footer>
        <UUser v-bind="product.description" size="xl" />
      </template>
    </UPageCard>
  </UPageGrid>
  </UPageSection>
</template>

