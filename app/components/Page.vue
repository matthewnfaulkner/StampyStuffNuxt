<script setup lang="ts">
import Hero from './block/Hero.vue';
import RichText from './block/RichText.vue';
import CardGroup from './block/CardGroup.vue';
import Pricing from './block/Pricing.vue';
import FormBlock from './block/FormBlock.vue';

defineProps<{
    title: String,
    blocks: PageBlock[]
}>()
const blockToComponent = (collectionName: string | null | undefined) => {
    switch (collectionName) {
        case 'block_hero':
            return Hero
        case 'block_richtext':
            return RichText
        case 'block_cardgroup':
            return CardGroup
        case 'block_pricing':
            return Pricing
        case 'block_form':
            return FormBlock;
        default:
            return 'div'
    }
}
</script>
<template>

    <Head>
        <title>{{ title }}</title>
    </Head>
    <h1>{{ title }}</h1>

    <div v-for="block in blocks" :key="block.id">
        <UPageSection>
        <component :is="blockToComponent(block.collection)" v-bind="block.item"></component>
        </UPageSection>
    </div>
</template>
