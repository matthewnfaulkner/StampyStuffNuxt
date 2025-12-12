<script setup lang="ts">
import Text from "@/components/base/Text.vue";

interface RichTextProps {
	data: {
		id?: string;
		tagline?: string;
		headline?: string;
		content?: string;
		alignment?: 'left' | 'center' | 'right';
		className?: string;
	}
}

const props = defineProps<RichTextProps>();


const { setAttr } = useVisualEditing();
</script>

<template>
	<div
		:class="[
			'mx-auto max-w-[600px] space-y-6',
			{
				'text-center': data.alignment === 'center',
				'text-right':data.alignment === 'right',
				'text-left': data.alignment === 'left',
			},
			data.className,
		]"
	>
		<BaseTagline
			v-if="data.tagline"
			:tagline="props.data.tagline"
			:data-directus="
				setAttr({
					collection: 'block_richtext',
					item: data.id,
					fields: 'tagline',
					mode: 'popover',
				})
			"
		/>
		<BaseHeadline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="
				setAttr({
					collection: 'block_richtext',
					item:data.id,
					fields: 'headline',
					mode: 'popover',
				})
			"
		/>
		<BaseText
			v-if="data.content"
			:content="data.content"
			:data-directus="
				setAttr({
					collection: 'block_richtext',
					item: data.id,
					fields: 'content',
					mode: 'drawer',
				})
			"
		/>
	</div>
</template>
