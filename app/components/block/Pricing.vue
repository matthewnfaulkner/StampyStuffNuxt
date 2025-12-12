<script setup lang="ts">
import Tagline from '../base/Tagline.vue';
import Headline from '../base/Headline.vue';
import PricingCard from './PricingCard.vue';
import { useDirectusTranslation } from '~/composables/useDirectusTranslation'

const { $directus, $readItems } = useNuxtApp()
const BlockPricing: Ref<BlockPricing | null> = ref(null)

const props = defineProps<PricingProps>();

const { translated } = useDirectusTranslation(props.translations)

interface PricingProps {
	id?: string;
	tagline?: string;
	headline?: string;
	translations?: PricingTranslation[];
	pricing_cards: Array<{
		id: string;
		title: string;
		description?: string;
		price?: string;
		badge?: string;
		features?: string[];
		translations?: PricingCardTranslation[];
		button?: {
			id: string;
			label: string | null;
			variant: string | null;
			url: string | null;
		};
		is_highlighted?: boolean;
		icon?: string;
		
	}>;
}

const { setAttr } = useVisualEditing();

</script>

<template>
	<section>
		<Tagline
			v-if="tagline"
			:tagline="translated?.tagline || tagline"
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
			v-if="headline"
			:headline="translated?.headline || headline"
			:data-directus="
				setAttr({
					collection: 'block_pricing',
					item: id,
					fields: 'headline',
					mode: 'popover',
				})
			"
		/>
		<UPricingPlans :plans="pricing_cards">
			<template #default>
				<div
					v-for="(plan, index) in  pricing_cards"
					:key="plan.title"
					:class="[
					'transition-all duration-300 rounded-2xl hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-secondary-100',
					pricing_cards.length % 2 === 1 && index === pricing_cards.length - 1
					? 'col-start-1 col-end-3 md:col-auto'
					: ''
					]"
				>
					<PricingCard :key="plan.id" :card="plan" />
				</div>
			</template>
		</UPricingPlans>
	</section>
</template>
