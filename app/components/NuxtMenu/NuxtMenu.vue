    <script setup lang="ts">
    import type { NavigationMenuItem } from '@nuxt/ui'
    import { useRoute } from '#imports';
    import IconShop from '../Icons/IconShop.vue';
    
    const route = useRoute()

    const items = [
    {
        label: 'Docs',
        to: '/',
        icon: IconShop,
    },
    {
        label: 'Components',
        icon: 'i-lucide-box',
        slot: 'components' as const,
        children: [
        {
            label: 'Link',
            description: 'Use NuxtLink with superpowers.'
        },
        {
            label: 'Modal',
            description: 'Display a modal within your application.'
        },
        {
            label: 'NavigationMenu',
            description: 'Display a list of links.'
        },
        {
            label: 'Pagination',
            description: 'Display a list of pages.'
        },
        {
            label: 'Popover',
            description: 'Display a non-modal dialog that floats around a trigger element.'
        },
        {
            label: 'Progress',
            description: 'Show a horizontal bar to indicate task progression.'
        }
        ]
    },
    {
        label: 'GitHub',
        icon: 'i-simple-icons-github'
    }
    ] satisfies NavigationMenuItem[]


    </script>

    <template>
    <UNavigationMenu
        :items="items"
        :ui="{
        viewport: 'sm:w-(--reka-navigation-menu-viewport-width)',
        content: 'sm:w-auto',
        childList: 'sm:w-96',
        childLinkDescription: 'text-balance line-clamp-2'
        }"
        class="w-full justify-center"
    >
        <template #docs-content="{ item }">
        <ul class="grid gap-2 p-4 lg:w-[500px] lg:grid-cols-[minmax(0,.75fr)_minmax(0,1fr)]">
            <li class="row-span-3">
                
            <Placeholder class="size-full min-h-48" />
            </li>

            <li v-for="child in item.children" :key="child.label">
            <ULink class="text-sm text-left rounded-md p-3 transition-colors hover:bg-elevated/50" active-class="router-link-exact-active">
                <p class="font-large text-highlighted">
                {{ child.label }}
                </p>
                <p class="text-muted line-clamp-2">
                {{ child.description }}
                </p>
            </ULink>
            </li>
        </ul>
        </template>
    </UNavigationMenu>
    </template>

<style scoped>
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
    .router-link-exact-active .menu-item span {
    color: yellow;
    }

    .menu-item:hover svg path.body,
    .menu-item.router-link-active svg path.body,
    .router-link-exact-active .menu-item svg path.body {
    fill: var(--color-primary);
    stroke: black;
    }

    .menu-item:hover svg path.head,
    .router-link-active .menu-item svg path.head,
    .router-link-exact-active .menu-item svg path.head {
    fill: #F54927;
    stroke: black;
    }

    .menu-item:hover svg path.flower,
    .menu-item.router-link-active svg path.flower,
    .router-link-exact-active .menu-item svg path.flower {
    fill: #dea1e4;
    stroke: black;
    }

    .menu-item:hover svg path.leaf,
    .menu-item.router-link-active svg path.leaf,
    .router-link-exact-active .menu-item svg path.leaf {
    fill: var(--color-text);
    stroke: black;
    }

    .menu-item:hover svg path.dot,
    .menu-item.router-link-active svg path.dot,
    .router-link-exact-active .menu-item svg path.dot {
    fill: black;
    stroke: black;
    }

    .menu-item:hover svg path.circle,
    .menu-item.router-link-active svg path.circle,
    .router-link-exact-active .menu-item svg path.circle {
    fill: #00eaff;
    stroke: black;
    }

    .menu-item:hover svg path.line,
    .menu-item.router-link-active svg path.line,
    .router-link-exact-active .menu-item svg path.line {
    stroke: var(--color-primary);
    }

    .menu-item:hover svg path.phone,
    .menu-item.router-link-active svg path.phone,
    .router-link-exact-active .menu-item svg path.phone {
    fill: #80f;
    stroke: black;
    }
</style>