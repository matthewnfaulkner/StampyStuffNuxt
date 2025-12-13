<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  const loading = ref(true)

  const {
    data: siteData,
    error: siteError,
    refresh,
  } = await useFetch('/api/site-data', {
    key: 'site-data',
  });

  const { isVisualEditingEnabled, apply } = useVisualEditing();

  const navigation = useTemplateRef('navigationRef');
  const footer = useTemplateRef('footerRef');

  if (siteError.value) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load site data. Please try again later.',
      fatal: true,
    });
  }

  useHead({
    style: [
      {
        id: 'accent-color',
        innerHTML: `:root { --accent-color: ${unref(siteData)?.globals.accent_color || '#6644ff'} !important; }`,
      },
    ],
    bodyAttrs: {
      class: 'antialiased font-sans',
    },
  });

  useSeoMeta({
    titleTemplate: `%s ${unref(siteData)?.globals.title}`,
    ogSiteName: unref(siteData)?.globals.title,
  });

  
  onMounted(() => {
    setTimeout(() => { loading.value = false }, 800) // example delay
  })


</script>
<template>

    <StickyHeader/>
    <div>
        <div v-if="loading" class="flex items-center justify-center h-screen">
          <StampySpinner :size="40" />
        </div>
        <UPage v-else class="mx-auto flex flex-col items-center justify-center px-4 py-1 max-w-dvw overflow-hidden min-h-screen">
          <UPageBody>
                <slot/>                       
          </UPageBody>
        </UPage>
    </div>

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © {{ new Date().getFullYear() }} Nicky Creative Enterprise
        </p>
      </template>

      <UNavigationMenu :items="items" variant="link" />

      <template #right >
        <div v-for="social in siteData?.globals.social_links">
          <UButton
            :icon="'i-simple-icons-'+social.service"
            color="secondary"
            variant="ghost"
            :to="social.url"
            target="_blank"
            :aria-label="social.service"
          />
        </div>
      </template>
    </UFooter>
</template>

<style>
  [v-cloak] {
    display: none;
  }
</style>