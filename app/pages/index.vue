<script setup lang="ts">
import type { pricingPlan } from '#build/ui';
import IconStamp from '~/components/Icons/IconStamp.vue';
import { withLeadingSlash, withoutTrailingSlash } from 'ufo';
import DirectusImage from '~/components/shared/DirectusImage.vue';
import  SvgIcon from '~/components/Icons/SvgIcon.vue';
import DirectusSvg from '~/components/shared/DirectusSvg.vue';
import type { Link, Section } from 'lucide-vue-next';
import type Tagline from '~/components/base/Tagline.vue';
const { enabled, state } = useLivePreview();
// Handle Live Preview adding version=main which is not required when fetching the main version.
const route = useRoute();
const version = route.query.version === 'main' ? undefined : (route.query.version as string);
const { $directus, $readItems, $rive } = useNuxtApp();
const { setAttr } = useVisualEditing();
const permalink = withoutTrailingSlash(withLeadingSlash(route.path));
const {
	data: page,
	error,
	refresh,
} = await useFetch<Page>('/api/pages/one', {
	key: `pages-${permalink}`,
	query: {
		permalink,
		preview: enabled.value ? true : undefined,
		token: enabled.value ? state.token : undefined,
		id: route.query.id as string,
		version,
	},
});        

interface PageBlocks {
  block_hero: BlockHero[];
  block_richtext: PageBlock[];
  block_gallery: PageBlock[];
  block_form: PageBlock[];
  block_pricing: BlockPricing[];
}
// Safely get blocks as an array of PageBlock
const blocks: PageBlock[] = Array.isArray(page.value?.blocks) 
  ? page.value.blocks 
  : [];

// Initialize the indexPageBlocks with empty arrays
const indexPageBlocks: PageBlocks = {
  block_hero: [],
  block_richtext: [],
  block_gallery: [],
  block_form: [],
  block_pricing: []
};
// Loop safely
blocks.forEach(block => {
  // Optional runtime type check
  if (block && typeof block.collection === "string" && block.collection in indexPageBlocks) {
    indexPageBlocks[block.collection as keyof PageBlocks].push(block?.item);
  }
});

</script>

<template>
  <main class="mx-auto flex flex-col items-center justify-center px-4 py-1 max-w-dvw overflow-hidden">
  <UPageHero
    v-for="hero in indexPageBlocks.block_hero"
    :title="hero.headline || ''"
    :description="hero.description || ''"
    :headline="hero.tagline || ''"
    orientation="horizontal"
    class="text-secondary-700"
    :ui="{
      wrapper: 'lg:ml-5 xl:ml-30 font-header',
      title: 'font-header text-secondary',
      links: 'font-sans',  
      description: 'text-secondary-700',
      headline: 'text-secondary-700 dark:text-secondary-200 gap-0 inline text-3xl',
    }"
  ><template #links>
    <UButton 
      v-if="hero.button_group?.buttons"
      v-for="button in hero.button_group.buttons"
      :label="button.label"
      color="tertiary"
      class="dark:bg-tertiary-300 dark:hover:text-white"
      size="xl"
      :href="button.url"
      :variant="button.variant"
      >
    </UButton>
  </template>
    <DirectusImage
				:uuid="hero.image"
				:alt="hero.tagline || hero.headline || 'Hero Image'"
				:fill="true"
				:sizes="hero.layout === 'image_center' ? '100vw' : '(max-width: 768px) 100vw, 50vw'"
				class="object-contain"
				:data-directus="
					setAttr({ collection: 'block_hero', item: hero.id, fields: ['image', 'layout'], mode: 'modal' })
				"
			/>
  </UPageHero>
  <USeparator size="xs" color="secondary" :avatar="{ src: '/logo.svg', size: '3xl', class: 'bg-transparent' }" />
  <UPageSection v-for="(plans) in indexPageBlocks.block_pricing"
    :title="plans.headline || ''" 
    :description="plans.tagline || ''"
    class=""
    :ui="{
      title: 'font-header text-secondary-600'
    }">
    <UPricingPlans 
      :title="plans.headline"
      :tagline="plans.tagline"
      class="lg:p-5 rounded-2xl"
    >  
            <UPricingPlan
              v-for="(plan, index) in plans.pricing_cards"
              v-bind="plan"
              :title= "plan.title || ''"  
              :price="`from RM ${plan.price || ''}`"
              :button="plan?.button"
              :class="[
              'h-full bg-primary dark:bg-secondary-800 ring-secondary-600 transition-all duration-300 rounded-2xl hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-secondary-100 col-span-2 sm:col-span-1',
              plans?.pricing_cards?.length % 2 === 1 && index === plans?.pricing_cards.length - 1
              ? 'sm:col-span-2 lg:col-span-1'
              : '' 
              ]"
              :ui="{
                title: 'text-center w-full',
                titleWrapper: 'w-full flex-none gap-0 block',
                body: 'items-center',
                button: 'hover:bg-secondary-700 dark:bg-primary dark:hover:bg-sky-200',
                features: 'w-full'
              }"
              >
              <template #header>
                <div class="flex flex-col items-center gap-2 p-4 rounded-t-xl">
                    <DirectusSvg
                    v-if="plan.image"
                    :uuid="plan.image"
                    :alt="plan.title || plan.title || 'Pricing Card Image'"
                    :fill="true"
                    class="w-40 h-40 mx-auto rounded-full object-cover absolute -top-25 md:-top-30 lg:-top-25"
                  />
                  </div>
              </template>
              <template #button>
                <UButton 
                    v-if="plan.button" 
                    :href="plan.button.url" 
                    :label="plan.button.label"
                    color="secondary"/>
              </template>
              
            </UPricingPlan>
    </UPricingPlans>  
  </UPageSection>
  </main>
</template>
