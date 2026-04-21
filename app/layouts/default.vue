<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { withoutLeadingSlash, withoutTrailingSlash } from 'ufo';
  const loading = ref(true)

  const {
    data: siteData,
    error: siteError,
    refresh,
  } = await useFetch('/api/site-data', {
    key: 'site-data',
  });

  const route = useRoute()

  const breadcrumbs = computed(() => {
    const segments = route.path.split('/').filter(Boolean)

    return segments.map((segment, index) => ({
      label: segment,
      to: '/' + segments.slice(0, index + 1).join('/')
    }))
  })

  const { apply } = useVisualEditing();

  const shopSettingsStore = useShopSettingsStore();
  shopSettingsStore.setShopSettings(unref(siteData)?.shopSettings as ShopSettings);

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
    apply({
		elements: [navigation.value?.navigationRef as HTMLElement, footer.value?.footerRef as HTMLElement],
		onSaved: () => {
			refresh();
		},
	});
  })


</script>
<template>

    <StickyHeader :site="siteData?.globals" :navigation="siteData?.headerNavigation" ref="navigationRef"/>
    <div>
        <div v-if="loading" class="flex items-center justify-center h-screen">
          <StampySpinner :size="40" />
        </div>
        <UPage v-else class="mx-auto flex flex-col items-center px-4 py-1 max-w-dvw overflow-hidden min-h-screen">
          <UPageBody class="pt-10  sm:max-w-none">
                <slot/>                       
          </UPageBody>
        </UPage>
    </div>

    <UFooter >
      <template #left>

        <div class="flex flex-col md:flex-row items-start gap-8 pt-8">
          
				<div class="flex flex-col items-start flex-1">
                  <p class="text-muted text-sm">
                  Copyright © {{ new Date().getFullYear() }} Nicky Creative Enterprise
                </p>
                  <nav v-if="siteData?.footerNavigation.items.length" class="w-full md:w-auto text-left text-muted text-sm pt-2">
                    <ul class="space-y-4 list-image-[url('/favicon.png')] list-inside">
                      <li v-for="item in siteData?.footerNavigation.items" :key="item.id" class="m-0 align-super">
                        <NuxtLink
                          v-if="item.page?.permalink"
                          :to="item.page.permalink"
                          class="text-nav font-medium hover:underline "
                        >
                          {{ item.title }}
                        </NuxtLink>
                        <a v-else :href="item.url || '#'" class="text-nav font-medium hover:underline">
                          {{ item.title }}
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
      </template>
      		<Container class="text-white">
			
		</Container>

      <template #right >
        <UColorModeSwitch />
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