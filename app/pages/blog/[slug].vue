<script setup lang="ts">
import RichText from '~/components/block/RichText.vue';
const { isVisualEditingEnabled, apply, setAttr } = useVisualEditing();


const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const { locale } = useI18n()
const pageUrl = useRequestURL();
const slug = computed(() => {
  return Array.isArray(route.params.slug)
    ? route.params.slug[0]
    : route.params.slug
});

// SSR + SSG aware — reruns when locale changes or slug changes
const { data, pending, error, refresh } = await useAsyncData(
  () => `post-${slug.value}-${locale.value}`,   // key must include locale
  async () => {
    const posts = await $directus.request(
      $readItems('posts', {
        filter: { slug: { _eq: slug.value } },
        fields: ['id', 'slug', 'title', 'content', 'translations.*', {'author' : ['first_name']}, 'published_at', 'seo'],
        limit: 1,
      })
    );

    if (!posts.length) {
      throw createError({ statusCode: 404, statusMessage: "Not found" });
    }

    const base = posts[0];

    if (locale.value === 'en') {
      return base; // default content
    }

    // find translation
    const t = base.translations.find(
      x => x.languages_code === locale.value
    );

    // fallback to default text if translation doesn't exist
    return {
      ...base,
      title: t?.title ?? base.title,
      content: t?.content ?? base.content
    };
  },
  {
    watch: [() => locale.value, () => slug.value], // react to locale changes
  }
);

const post = computed(() => data.value);


useSeoMeta({
	title: post.value?.seo?.title || post.value?.title || '',
	description: post.value?.seo?.meta_description || '',
	ogTitle: post.value?.seo?.title || post.value?.title || '',
	ogDescription: post.value?.seo?.meta_description || '',
	ogUrl: pageUrl.toString(),
});

// Helper functions for Visual Editing
function applyVisualEditing() {
	apply({
		onSaved: async () => {
			await refresh();
		},
	});
}

function applyVisualEditingButton() {
	apply({
		elements: document.querySelector('#visual-editing-button') as HTMLElement,
		customClass: 'visual-editing-button-class',
		onSaved: async () => {
			await refresh();
			// This makes sure the visual editor elements are updated after the page is refreshed. In case you've added new blocks to the page.
			await nextTick();
			applyVisualEditing();
		},
	});
}

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	applyVisualEditingButton();
	applyVisualEditing();
});

</script>

<template>
  
  <div  class="relative mx-auto flex flex-col items-center justify-center sm:px-4 py-1 max-w-dvw overflow-hidden">
    <UPageSection v-if="post" class="w-full lg:max-w-[70%] lg:gap-0"
      :ui="{
        container: 'gap-2 lg:gap-2'
      }">
        <BaseHeadline 
          :headline="post.title" 
          class="p-0"
          :data-directus="
					  setAttr({ collection: 'posts', item: post.id, fields: ['title'], mode: 'modal' })
				  "/>
        <BaseTagline :tagline="`by ${post.author.first_name}`"/>
        <BaseText
          v-if="post.content"
          :content="post.content"
          :data-directus="
					  setAttr({ collection: 'posts', item: post.id, fields: ['content'], mode: 'modal' })
				  "
          class="
            bg-white 
            dark:bg-secondary-900 
            lg:p-8 p-2 
            rounded-4xl
            shadow-lg shadow-secondary-800"
        />
    </UPageSection>
    <div v-else>
      Post Not Found
    </div>
	</div>
  
</template>
