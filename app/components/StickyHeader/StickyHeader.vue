<script setup lang="ts">
  import { ref } from 'vue';
  // eslint-disable-next-line import/extensions
  import { useFixedHeader } from 'vue-use-fixed-header';
  import StampyMenubar from '@/components/StampyMenubar/StampyMenubar.vue';
  // import NuxtMenu from '~/components/NuxtMenu/NuxtMenu.vue';

  const props = defineProps<{
    navigation: { items: NavigationItem[] };
    site: { logo?: string; logo_dark_mode?: string, title?: string };
  }>();

  const headerRef = ref(null);
  const loaded = ref(false);

  const onMenubarLoaded = () => {
    loaded.value = true;
  };

  // eslint-disable-next-line no-unused-vars
  const { styles } = useFixedHeader(headerRef);


</script>

<template>
  <header class="Header" ref="headerRef" v-show="loaded"
    :style="styles">
      <StampyMenubar @loaded="onMenubarLoaded" :navigation="navigation" :site="site"/>
  </header>
</template>


<style>
  /* stylelint-disable-next-line selector-class-pattern */
  .Header {
    position: fixed; /* or sticky */
    top: 0;
    z-index: 10;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1rem;
  }

  /* stylelint-disable-next-line selector-class-pattern */
  .Header a {
    color: white;
  }

  [v-cloak] {
    display: none;
  }
</style>
