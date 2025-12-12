<script setup lang="ts">
import { useDirectusTranslation } from '~/composables/useDirectusTranslation'

const { locale } = useI18n();
const props = defineProps<PricingCardProps>();

const { translated } = useDirectusTranslation(props.card.translations)


interface PricingCardProps {
	card: {
		id: string;
		title: string;
		description?: string;
		price?: string;
		badge?: string;
		features?: string[];
		translations?: PricingCardTranslation[];
		icon?: string	
		button?: {
			id: string;
			label: string | null;
			variant: string | null;
			url: string | null;
		};
		is_highlighted?: boolean;
	};
}

const { setAttr } = useVisualEditing();

</script>

<template>
	<UPricingPlan
		:title= "translated?.title || card.title"
		:price="card.price"
		:button="card.button?.id"
		class="h-full bg-primary dark:bg-secondary-800 ring-secondary-600"
		:ui="{
		title: 'text-center',
		body: 'items-center',
		button: 'hover:bg-secondary-700 dark:bg-primary dark:hover:bg-sky-200'
		}"
		>
		<template #header>
		<div class="flex flex-col items-center gap-2 p-4 rounded-t-xl">
			<component
			v-if="card.icon"
			:is="card.icon"
			class="w-40 h-40 mx-auto rounded-full object-cover absolute -top-20 lg:-top-15"
			/>
		</div>
	</template>
	<template #footer>

	</template>
	</UPricingplan>
</template>
