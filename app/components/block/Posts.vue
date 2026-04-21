<script setup lang="ts">

interface PostsProps {
	data: {
		id?: string;
		tagline?: string;
		headline?: string;
		posts: Post[];
		limit: number;
	};
}

const props = defineProps<PostsProps>();

const route = useRoute();
const router = useRouter();

const perPage = props.data.limit || 6;
const currentPage = ref(Number(route.query.page) || 1);
const visiblePages = 5;

const { data: postsData, error } = await useFetch<{
	posts: Post[];
	count: number;
}>('/api/posts', {
	key: `block-posts-${props.data?.id}-${currentPage.value}`,
	query: { page: currentPage, limit: perPage },
	watch: [currentPage],
});

const posts = computed(() => postsData.value?.posts || []);
const totalPages = computed(() => Math.ceil((postsData.value?.count || 0) / perPage));

const paginationLinks = computed(() => {
	const pages: (number | string)[] = [];

	if (totalPages.value <= visiblePages) {
		for (let i = 1; i <= totalPages.value; i++) pages.push(i);
	} else {
		const rangeStart = Math.max(1, currentPage.value - 2);
		const rangeEnd = Math.min(totalPages.value, currentPage.value + 2);
		if (rangeStart > 1) pages.push('ellipsis-start');
		for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
		if (rangeEnd < totalPages.value) pages.push('ellipsis-end');
	}

	return pages;
});

function handlePageChange(page: number) {
	if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
		currentPage.value = page;
		router.push({ query: { page } });
	}
}

const { setAttr } = useVisualEditing();
</script>

<template>
	<div class="w-dvw lg:w-[800px] lg:max-w-[100%] px-10">
		<BaseTagline
			v-if="data.tagline"
			:tagline="data.tagline"
			:data-directus="
				setAttr({
					collection: 'block_posts',
					item: data.id,
					fields: 'tagline',
					mode: 'popover',
				})
			"
		/>
		<BaseHeadline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="setAttr({ collection: 'block_posts', item: data.id, fields: 'headline', mode: 'popover' })"
		/>

		<div
			class=""
			:data-directus="
				setAttr({
					collection: 'block_posts',
					item: data.id,
					fields: ['collection', 'limit'],
					mode: 'popover',
				})
			"
		>	
			<template v-if="posts?.length">
				<UPageCard
				v-for="post in posts"
					:key="post.id"
					:title="post.title"
					:description="post.description || ''"
					icon="i-simple-icons-tailwindcss"
					:to="`/blog/${post.slug}`"
					orientation="horizontal"
					reverse
					:class="[
        ' transition-all duration-300 rounded-2xl hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-secondary-100',
        ]"
      class="h-full mt-10 rounded-none  bg-primary ring ring-secondary p-0 dark:bg-secondary-950 hover:bg-primary dark:hover:bg-secondary-950"
  					>
				<SharedDirectusImage
							v-if="post.image"
							:uuid="typeof post.image === 'string' ? post.image : post.image?.id"
							:alt="post.title"
							class="w-auto h-[256px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
						/>
				<template #footer >
					by {{ post.author.first_name }}
					
				</template>
  				</UPageCard>
				<!--<NuxtLink
					v-for="post in posts"
					:key="post.id"
					:to="`/blog/${post.slug}`"
					:class="[
        'transition-all duration-300 rounded-2xl hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-secondary-100',
        ]"
      class="h-full rounded-none border-0 bg-primary ring ring-secondary p-4 dark:bg-secondary-950 hover:bg-primary dark:hover:bg-secondary-950"
				>
				
					<div class="relative w-full h-[256px] overflow-hidden rounded-lg">
						<SharedDirectusImage
							v-if="post.image"
							:uuid="typeof post.image === 'string' ? post.image : post.image?.id"
							:alt="post.title"
							class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
						/>
					</div>
					<div class="p-4">
						<h3 class="text-xl group-hover:text-accent font-heading transition-colors duration-300">
							{{ post.title }}
						</h3>
						<p v-if="post.description" class="text-sm text-foreground mt-2">
							{{ post.description }}
						</p>
						<p v-if="post.description" class="text-muted text-foreground mt-2">
							by {{ post?.author?.first_name }}
						</p>
					</div>
				</NuxtLink>-->
			</template>
			<p v-else class="text-center text-gray-500">No posts available.</p>
		</div>
		<ClientOnly>
			<Pagination v-if="totalPages > 1 && posts?.length" class="mt-6">
				<div v-if="totalPages" class="flex items-center justify-center space-x-2">
					<div v-if="totalPages > 5 && currentPage > 1" class="flex items-center">
						<PaginationFirst @click="handlePageChange(1)">
							<ChevronsLeft class="h-4 w-4" />
						</PaginationFirst>
						<PaginationPrev @click="handlePageChange(currentPage - 1)">
							<ChevronLeft class="h-4 w-4" />
						</PaginationPrev>
					</div>
					<template v-for="(page, index) in paginationLinks" :key="index">
						<PaginationListItem v-if="typeof page === 'number'" :value="page" @click="handlePageChange(page)">
							<Button variant="outline" :class="{ 'border-none': currentPage !== page }">
								{{ page }}
							</Button>
						</PaginationListItem>
						<PaginationEllipsis v-else class="px-2" />
					</template>
					<div v-if="totalPages > 5 && currentPage < totalPages" class="flex items-center">
						<PaginationNext @click="handlePageChange(currentPage + 1)">
							<ChevronRight class="h-4 w-4" />
						</PaginationNext>
						<PaginationLast @click="handlePageChange(totalPages)">
							<ChevronsRight class="h-4 w-4" />
						</PaginationLast>
					</div>
				</div>
			</Pagination>
		</ClientOnly>
	</div>
</template>
