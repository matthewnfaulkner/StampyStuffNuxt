<template>
    <div class="card">
        <Menubar :model="navItems || items" breakpoint="768px" class="bg-secondary font-header hidden">
            <template #start>
                <ULink as="h1" active-class="onhome" class="text-white text-xl lg:text-3xl hover:text-primary" to="/">{{site.title || 'Stampy Stuff'}}</ULink>
            </template>
            <template #item="{ item, props, }" class="bg-secondary">
                    <ULink 
                        v-if="item.route" 
                        :to="localePath(item.route)" 
                        activeClass="router-link-exact-active"
                        :class="[
                          'menu-item', // Your default classes
                          {'router-link-exact-active': isLinkActive(item.route)} // The dynamic class
                        ]"
                        v-bind="props.action">
                        <component
                          v-if="item.iconComponent"
                          :is="item.iconComponent"
                          class="menu-icon"
                        />
                        <SvgIcon  v-if="item.icon" :fileName="item.icon">

                        </SvgIcon>
                        <span class="text-white text-2xl">{{ item.label }}</span>
                      </ULink>
            </template>
            <template #end>
                <div class="flex items-center gap-2">

                       <CartSlideover></CartSlideover>
                </div>
            </template>
        </Menubar>
        <UBreadcrumb 
              v-if="breadcrumbs.length > 1" 
              separator-icon="i-lucide-chevron-right"
              :items="breadcrumbs" 
              class=" mb-2 text-5xl"
              
              :ui="{
                linkLabel: 'text-xl text-secondary dark:text-secondary-200',
              }"/>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// eslint-disable-next-line import/extensions
import Menubar from 'primevue/menubar';
import SvgIcon from '../Icons/SvgIcon.vue';
import { useCartStore } from '~/stores/cartStore';

const { t } = useI18n();
const localePath = useLocalePath();
const cartStore = useCartStore();
useRouter();

// Props already defined
const props = defineProps<{
  navigation: { items: NavigationItem[] };
  site: { logo?: string; logo_dark_mode?: string, title?: string };
}>();

const route = useRoute();

const emit = defineEmits<{
  (e: 'loaded'): void
}>();

onMounted(() => {
  emit('loaded'); // notify parent that menu is ready
});

const navItems = computed(() => props.navigation.items.map((item) => ({
  label: item.title,
  route: item.type == 'url' ? item.url : item?.page?.permalink || '',
  icon: item.title.toLowerCase(),
  badge: 3
})))

const items = computed(() => [
  {
    label: t('navigation.home'),
    icon: 'shop',
    route: '/shop',
    active: true, // active state
  },
  {
    label: t('navigation.about'),
    icon: 'about',
    route: '/about-us',
    badge: 3,
  },
  {
    label: t('navigation.contact'),
    icon: 'contact',
    route: '/contact',
    badge: 3,
  },
]);

// Assuming 'item.route' provides a path like '/shop' or '/about'
const isLinkActive = (itemRoute: string) => {
  if (!itemRoute) return false;
  // Check if the current path starts with the item's path
  return route.path.startsWith(itemRoute);
};


const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)

  return segments.map((segment, index) => ({
    label: segment,
    to: '/' + segments.slice(0, index + 1).join('/')
  }))
});
</script>

<style>
.logo
  /* Default */
.menu-item svg {
  overflow: visible;
}

.menu-item svg path {
  stroke: white;
}

/* Hover and Active share the same effects */
.menu-item:hover span,
.menu-item.router-link-active span,
.router-link-exact-active.menu-item span {
  color: yellow;
}

.menu-item:hover svg path.body,
.menu-item.router-link-active svg path.body,
.router-link-exact-active.menu-item svg path.body {
  fill: var(--color-primary);
  stroke: black;
}

.menu-item:hover svg path.head,
.router-link-active.menu-item svg path.head,
.router-link-exact-active.menu-item svg path.head {
  fill: #F54927;
  stroke: black;
}

.menu-item:hover svg path.flower,
.menu-item.router-link-active svg path.flower,
.router-link-exact-active.menu-item svg path.flower {
  fill: #dea1e4;
  stroke: black;
}

.menu-item:hover svg path.leaf,
.menu-item.router-link-active svg path.leaf,
.router-link-exact-active.menu-item svg path.leaf {
  fill: var(--color-text);
  stroke: black;
}

.menu-item:hover svg path.dot,
.menu-item.router-link-active svg path.dot,
.router-link-exact-active.menu-item svg path.dot {
  fill: black;
  stroke: black;
}

.menu-item:hover svg path.circle,
.menu-item.router-link-active svg path.circle,
.router-link-exact-active.menu-item svg path.circle {
  fill: #00eaff;
  stroke: black;
}

.menu-item:hover svg path.line,
.menu-item.router-link-active svg path.line,
.router-link-exact-active.menu-item svg path.line {
  stroke: var(--color-primary);
}

.menu-item:hover svg path.phone,
.menu-item.router-link-active svg path.phone,
.router-link-exact-active.menu-item svg path.phone {
  fill: #80f;
  stroke: black;
}

.onhome{
  color: var(--color-primary)!important
}

[v-cloak] {
  display: none !important;
}
</style>
