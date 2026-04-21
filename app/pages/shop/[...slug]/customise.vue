<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js';
import { useFileStorage } from '~/composables/useFileStorage.client';

const { $directus, $readItems } = useNuxtApp()
const { locale } = useI18n()
const toast = useToast()
const overlay = useOverlay()
const route = useRoute()
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


if (selectedVariant.value === undefined) {
	throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true });
}

const variantCustomisation = computed(() => {
  if(editing) {
    return  selectedVariant.value?.customisationFields;
  }
  return customisationStore.items[selectedVariant.value.id]
});


const { saveFile, getFile } = useFileStorage();


const productFields: ProductField[] = product.value?.product_fields?.flatMap(field => field.product_fields_id)


const customiseForm: CustomForm = {
  id: selectedVariantId as string,
  on_success: 'redirect',
  submit_label: 'Continue',
  success_message: 'Item added to cart',
  title: 'Customise your stamp',
  success_redirect_url:`/shop/${slug}/addons?${route.params}`,
  is_active: true,
  fields: productFields
}


const isSubmitted = ref(false);
const submitError = ref<string | null>(null);

const initialValues = ref<Record<string, any>>({})
const isReady = ref(false) 

onMounted(async () => {
  if (!variantCustomisation.value) {
    isReady.value = true; 
    return
  }

  const values: Record<string, any> = {}

  for (const field of variantCustomisation.value.fields) {
    if (field.type === 'file') {
      const storedFiles: File[] = []

      if (Array.isArray(field.value)) {
        for (const file of field.value) {
          // getFile is async, so we await it
          const storedFileBlob = await getFile(file)
          if (storedFileBlob) {
            // convert Blob back to File if needed
            const fileObj = new File([storedFileBlob], file, { type: storedFileBlob.type })
            storedFiles.push(fileObj)
          }
        }
      }

      values[field.name] = storedFiles
    } else {
      values[field.name] = field.value
    }
  }

  initialValues.value = values
  isReady.value = true;
})


const handleSubmit = (data: Record<string, any>) => {

  submitError.value = null;
	try {

		const fieldsWithNames = customiseForm.fields.map((field) => {

      let submittedValue = data[field.name || ''];

      if (field.type == 'file') {
          const fileKeys: string[] = [];
          if (submittedValue instanceof Array) {
              submittedValue.forEach((file) => {
                  saveFile(file.name, file);
                  fileKeys.push(file.name);
              })
          } else if (submittedValue instanceof File) {
              saveFile(submittedValue.name, submittedValue)
              fileKeys.push(submittedValue.name);
          }
          submittedValue = fileKeys
      }

      return {
        id: field.id,
        name: field.name || '',
        type: field.type || '',
        value: submittedValue || '',}
  });

  customisationStore.updateItem(selectedVariant.value.id, fieldsWithNames);
    
	} catch {
		submitError.value = 'Failed to submit the form. Please try again later.';
	}

  if(editing) {
    navigateTo(`/shop/${slug}/addons?editing=${selectedVariant.value.id}`)
  }
  else {
    navigateTo(`/shop/${slug}/addons?variantId=${selectedVariant.value.id}`)
  }
}
</script>

<template>
  <UPageSection
      title="Customising"
      class="my-15"
      :ui="{
        title: 'font-header text-secondary',
        container: 'py-0 sm:py-0 md:py-0 lg:py-0 md:max-w-200'
    }
    ">
    <UPageCard :title="product?.title" :description="selectedVariant?.size || ''" orientation="horizontal">
        <div>
          <UiPrice currency="RM" :amount="selectedVariant?.price" />
        </div>
    </UPageCard>
    		<FormsDynamicForm
          v-if="isReady"
          :fields="customiseForm.fields"
          :initial-values="initialValues"
          :onSubmit="handleSubmit"
          :submitLabel="customiseForm.submit_label || 'Submit'"
          :formId="customiseForm.id"
		/>
  </UPageSection>
</template>
