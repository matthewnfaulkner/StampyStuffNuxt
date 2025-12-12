<script setup lang="ts">
const { $directus, $readItems } = useNuxtApp()
const route = useRoute()
const { locale } = useI18n()

const slug = computed(() => {
  return Array.isArray(route.params.slug)
    ? route.params.slug[0]
    : route.params.slug
});

// SSR + SSG aware — reruns when locale changes or slug changes
const { data, pending, error } = await useAsyncData(
  () => `post-${slug.value}-${locale.value}`,   // key must include locale
  async () => {
    const posts = await $directus.request(
      $readItems('posts', {
        filter: { slug: { _eq: slug.value } },
        fields: ['id', 'slug', 'title', 'content', 'translations.*'],
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
</script>

<template>
  <div v-if="post">
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
  </div>
</template>
