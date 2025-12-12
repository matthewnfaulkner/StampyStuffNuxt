<script setup>
import { ref } from 'vue';
// eslint-disable-next-line import/extensions
import { useFixedHeader } from 'vue-use-fixed-header';
import StampyMenubar from '@/components/StampyMenubar/StampyMenubar.vue';
// import NuxtMenu from '~/components/NuxtMenu/NuxtMenu.vue';


const headerRef = ref(null);

// eslint-disable-next-line no-unused-vars
const { styles } = useFixedHeader(headerRef);
</script>
<script>

export default { components: { StampyMenubar } };

</script><template>
  <header class="Header" ref="headerRef"
    :style="styles">
      <StampyMenubar />
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

</style>
