<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useWindowSize } from '@vueuse/core'
import Headline from '~/components/base/Headline.vue';

const route = useRoute()
const pageUrl = useRequestURL();

const { locale } = useI18n()
const toast = useToast()
const overlay = useOverlay()
const router = useRouter();
const sort = ref('');

const slug = computed(() => {
  return Array.isArray(route.params.slug)
    ? route.params.slug[0]
    : route.params.slug
});


const currentPage = ref(Number(route.query.page) || 1);
const visiblePages = 5;

const activeCategory = ref([]);
const activeSubCategory = ref([]);
const shopSettingsStore = useShopSettingsStore();
const shopSettings = shopSettingsStore.getShopSettings();

const {
	data: categoryData,
} = await useFetch<{categories: Category[], count: number}>('/api/categories', {
	key: `categories`,
  query: {
    limit: 10,
    parent: null
  }
});

if (!categoryData.value) {
	throw createError({ statusCode: 404, statusMessage: 'No Categories found', fatal: true });
}
const categories = categoryData.value?.categories;

const categoryOptions = categories
  .map(category => ({
    label: category.title || '',
    value: category.id,
  }));

const categoryCount = categoryData.value?.count;

const {
	data: shop,
	error,
	refresh,
} = await useFetch<{products: Product[], count: number}>('/api/products', {
	key: `products`,
	getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  query: {
    limit: -1,
    page: currentPage,
    sort: sort,
    subcategories: activeSubCategory,
    activeCategory: activeCategory,
  }
});


useSeoMeta({
	title: shopSettings?.seo?.title || 'Stampy Shop',
	description: shopSettings?.seo?.meta_description || 'Browse all stampy stuff\'s wonderful wares.',
	ogTitle: shopSettings?.seo?.title || 'Stampy Shop',
	ogDescription: shopSettings?.seo?.meta_description || 'Browse all stampy stuff\'s wonderful wares.',
	ogUrl: pageUrl.toString(),
});

const products = computed(() => shop.value?.products ?? []);

const totalProducts = computed(() => shop.value?.count ?? 0);

const subCategoryOptions = computed(() => {
  return activeCategory.value.map(categoryId =>
    (subCategoriesByCategoryId[categoryId] ?? []).map(sub => ({
      label: sub.title || '',
      value: sub.id,
    }))
  );
})

const allVariants = computed(() => 
  products.value?.flatMap(product =>
    product?.variants?.map(variant => ({
      ...variant,
      product, // reference to the original product object
    }))
  ) ?? []
);


type SubCategoryLookup = Record<string, Category[]>;

const subCategoriesByCategoryId: SubCategoryLookup =
  Object.fromEntries(
    categories.map(category => [
      category.id,
      category.sub_categories ?? [],
    ])
  );

const sortedProducts = computed(() => {
  if (allVariants.value===undefined) return []

  const list = [...allVariants.value]

  switch (sort.value) {
    case '-variants.price':
      return list.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0))

    case 'variants.price':  
      return list.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0))

    case 'sort':
      return list.sort((a, b) => (b?.product.sort ?? 0) - (a?.product.sort ?? 0))

    case 'name-desc':
      return list.sort((a, b) =>
        (b?.size ?? '').localeCompare(a?.size ?? '')
      )

    default:
      return list.sort((a, b) => Number(b?.featured) - Number(a?.featured) || ((a?.product?.sort || 0) - (b?.product?.sort || 0)));
  }
})


const shopMenuItems = [
  {
    label: 'Sort',
    icon: 'i-lucide-book-open',
    slot: 'sort' as const,
  },
  {
    label: 'Categories',
    icon: 'i-lucide-book-open',
    slot: 'categories' as const,
  },
  {
    slot: 'subcategories' as const,
  },

] satisfies NavigationMenuItem[]

const doRefresh = async () => {
    await refresh();
  };

watch(sort, () => {
  doRefresh();
});

watch(activeCategory, () => {
  activeSubCategory.value = activeCategory.value.flatMap(categoryId =>
    (subCategoriesByCategoryId[categoryId] ?? []).map(sub => sub.id)
  );

  doRefresh();
});

const sortOptions = ref(
  [{
    label: 'Price (Low to High)', 
    value: '-variants.price'
  },
  {
    label: 'Price (High to Low)',
    value: 'variants.price'}
  ]
)

const totalPages = computed(() => Math.ceil((shop.value?.count || 0) / perPage));

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

const scrollArea = useTemplateRef('scrollArea')
const { width } = useWindowSize();

const lanes = computed(() => Math.max(1, Math.min(3, Math.floor(width.value / 250))))
const gap = computed(() => Math.max(1, Math.min(25, Math.floor(width.value / 50))))


</script>
<template>
<UPageSection
    title="Stampy Shop"
    class="justify-start"
    :ui="{
        title: 'font-header text-secondary dark:text-primary',
        container: 'py-10 sm:py-10 md:py-10 lg:py-10 sm:gap-0 gap-0 max-w-[90%]',
        wrapper: 'flex-wrap'
    }
    ">
    <UNavigationMenu class="lg:mx-30 text-black " :items="shopMenuItems">
      <template #sort="{ item }">
        <USelect v-model="sort" placeholder="Sort" :items="sortOptions" class="w-50  placeholder:text-secondary " highlight color="secondary" variant="outline" :ui="{placeholder: 'text-secondary-700 dark:text-secondary-200'}"/>
      </template>
      <template #categories="{ item }">
        <USelect v-model="activeCategory" placeholder="All Categories" multiple :items="categoryOptions" class="w-50" highlight color="secondary" variant="outline" :ui="{placeholder: 'text-secondary-700 dark:text-secondary-200'}"/>
      </template>
      <template #subcategories="{ item }" >
        <USelect v-if="subCategoryOptions.length >0" v-model="activeSubCategory" placeholder="All Sub Categories" multiple :items="subCategoryOptions" class="w-50" highlight color="secondary" variant="outline" :ui="{placeholder: 'text-secondary-700 dark:text-secondary-200'}"/>
      </template>
    </UNavigationMenu>

    <UScrollArea
      v-if="sortedProducts.length > 0"
      ref="scrollArea"
      v-slot="{ item, index }"
      :items="sortedProducts"
      :virtualize="{
        gap: gap,
        lanes: lanes,
      }"
      class=" w-full lg:w-[80%] sm:w-lvw max-w-[100%] h-128 p-4 m-auto"
      :style="{ 'scrollbar-color': 'var(--color-secondary-600) transparent' }"

    >
    <UPageCard
      variant="solid"
      :to="`/shop/${ item?.product.slug }?variant=${ item?.id }`"
      :class="[
        'transition-all duration-300 rounded-2xl hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-secondary-100',
        ]"
      class="h-full rounded-none bg-primary ring dark:bg-secondary-950 hover:bg-primary dark:hover:bg-secondary-950"
      :ui="{
        title: 'text-center',
        body: 'items-center',
        root: 'text-secondary dark:text-primary',
        container: 'gap-y-0 lg:gap-y-4',
        header: 'm-0',
       }"
    >
      <template #header v-if="item?.featured">
        <UBadge size="sm" color="info">Best Seller</UBadge>
      </template>
      <template #default> 
        
        <div v-for="(product_field) in item?.product_fields">
          {{ product_field }}
        </div>
              <SharedDirectusImage :uuid = item?.image class="w-[80%] m-auto"/>
              <div class="text-lg lg:text-2xl text-secondary-600 dark:text-primary" v-html="item?.size"></div>
              <div class="text-sm lg:text-lg">{{ item?.product.title }}</div>
              <div class="text-right text-secondary-800 lg:text-xl dark:text-white text-lg pt-1">RM {{ item?.price }}</div>              
      </template>
      <template #footer>
        <UUser v-bind="item.description" size="xl" />
      </template>
    </UPageCard>
  </UScrollArea>
  <Headline v-else headline="No Matching Products Found" class="text-center h-128 justify-center flex flex-col"/>
  <!--<UPageGrid  
    v-if="sortedProducts.length > 0" 
    class="lg:mx-30 grid-cols-2 sm:grid-cols-3 gap-2 lg:gap-8" >
    
    <UPageCard
      v-for="(product, index) in sortedProducts"
      :key="index"
      variant="solid"
      :to="`/shop/${ product?.product.slug }?variant=${ product?.id }`"
      :class="[
        'transition-all duration-300 rounded-2xl hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-secondary-100',
        ]"
      class="h-full rounded-none bg-primary ring dark:bg-secondary-950 hover:bg-primary dark:hover:bg-secondary-950"
      :ui="{
        title: 'text-center',
        body: 'items-center',
        root: 'text-secondary dark:text-primary',
        container: 'gap-y-0 lg:gap-y-4'
       }"
    >
      <template #header v-if="product?.featured">
        <UBadge size="sm" color="info">Best Seller</UBadge>
      </template>
      <template #default> 
        
        <div v-for="(product_field) in product?.product_fields">
          {{ product_field }}
        </div>
              <SharedDirectusImage :uuid = product?.image class=""/>
              <div class="text-lg lg:text-2xl text-secondary-600 dark:text-primary" v-html="product?.size"></div>
              <div class="text-sm lg:text-lg">{{ product?.product.title }}</div>
              <div class="text-right text-secondary-800 text-xl dark:text-white">RM {{ product?.price }}</div>              
      </template>
      <template #footer>
        <UUser v-bind="product.description" size="xl" />
      </template>
    </UPageCard>
  
  </UPageGrid>
        <BaseHeadline v-else headline="No Products Found" class="text-center"/>
    <ClientOnly>
			<Pagination v-if="totalPages > 1 && sortedProducts?.length" class="mt-6">
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
-->
  </UPageSection>
</template>

