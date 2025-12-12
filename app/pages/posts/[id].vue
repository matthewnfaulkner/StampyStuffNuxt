<script setup>
const { $directus, $readItem, $isPreview, $previewToken, $previewVersion, $withToken } = useNuxtApp()
const route = useRoute()
let post = ref(null)
const { locale } = useI18n()

const slug = computed(() => {
  return Array.isArray(route.params.slug)
    ? route.params.slug[0]
    : route.params.slug
});
if ($isPreview) {
    const { data, error } = await useAsyncData('post', async () => {
        try {
            const posts = await $directus.request(
                $withToken($previewToken, $readItem('posts', route.params.id, { version: $previewVersion, },))
            )

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

        } catch (error) {
            throw createError({
                statusCode: 404,
                statusMessage: "Post not found"
            })
        }


    },
    {
        watch: [() => locale.value, () => slug.value], // react to locale changes
    })

    if (error.value) {
        throw createError({
            statusCode: 404,
            statusMessage: "Post not found"
        })
    }

    post = computed(() => data.value);
} else {
    const { data, error, pending } = await useAsyncData(() => `post-${slug.value}-${locale.value}`, async () => {
        const posts = await $directus.request($readItem('posts', route.params.id, {fields: ['id', 'slug', 'title', 'content', 'translations.*']}))

        const base = posts;

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
    )

    if (error.value) {
        throw createError({
            statusCode: 404,
            statusMessage: "Post not found"
        })
    }

    post = computed(() => data.value);
}

</script>
<template>
    <div v-if="post">
        <h1>{{ post.title }}</h1>
        <p>{{ post.content }}</p>
    </div>
    <div v-else>Loading...</div>
</template>
