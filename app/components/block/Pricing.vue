<script setup lang="ts">
import Tagline from '../base/Tagline.vue';
import Headline from '../base/Headline.vue';
import PricingCard from './PricingCard.vue';
import { useDirectusTranslation } from '~/composables/useDirectusTranslation'

const BlockPricing: Ref<BlockPricing | null> = ref(null)




interface PricingProps {
	data: {
		id?: string;
		tagline?: string;
		headline?: string;
		pricing_cards: Array<{
			id: string;
			title: string;
			description?: string;
			price?: string;
			badge?: string;
			features?: string[];
			button?: {
				id: string;
				label: string | null;
				variant: string | null;
				url: string | null;
			};
			is_highlighted?: boolean;
		}>;
	};
}

const props = defineProps<PricingProps>();
const { setAttr } = useVisualEditing();

</script>

<template>
	<section>
	<Tagline
			v-if="data.tagline"
			:tagline="data.tagline"
			class="text-center"
			:data-directus="
				setAttr({
					collection: 'block_pricing',
					item: id,
					fields: 'tagline',
					mode: 'popover',
				})
			"
		/>
	<Headline
		v-if="data.headline"
		:headline="data.headline"
		class="mb-35 lg:mb-25 text-center"
		:data-directus="
			setAttr({
				collection: 'block_pricing',
				item: id,
				fields: 'headline',
				mode: 'popover',
			})
		"
	/>
		<UPricingPlans 
      class="lg:p-5 rounded-2xl mb-5"
    >
            <UPricingPlan
              v-for="(plan, index) in data.pricing_cards"
              v-bind="plan"
              :title= "plan.title || ''"  
              :price="`from RM ${plan.price || ''}`"
              :button="plan?.button"
			  :to="plan.button?.url"
			  
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
			  :data-directus="
						setAttr({ collection: 'block_pricing_cards', item: plan.id, fields: ['*'], mode: 'modal' })
					"
              >
              <template #header>
                <div class="flex flex-col items-center gap-2 p-4 rounded-t-xl">
                    <SharedDirectusImage
                    v-if="plan.image"
                    :uuid="plan.image"
                    :alt="plan.title || plan.title || 'Pricing Card Image'"
                    :fill="true"
                    class="w-40 mx-auto object-cover absolute -top-25 md:-top-30 lg:-top-25"
					:data-directus="
						setAttr({ collection: 'block_pricing_cards', item: plan.id, fields: ['image'], mode: 'modal' })
					"
                  />
                  </div>
              </template>
              <template #button>
                <UButton 
                    v-if="plan.button" 
                    :href="plan.button.url" 
                    :label="plan.button.label"
					:data-directus="
						setAttr({ collection: 'block_pricing_cards', item: plan.id, fields: ['button'], mode: 'modal' })
					"
                    color="secondary"/>
              </template>
              
            </UPricingPlan>
    </UPricingPlans> 

	</section>

	 
</template>


