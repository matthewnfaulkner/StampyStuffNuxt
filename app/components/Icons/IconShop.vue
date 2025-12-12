<template>
  <svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="-0.879173 -1.314 29.19 29.06">
    <filter id="scribble">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="1" />
      <feDisplacementMap in="SourceGraphic" scale=".4" />
    </filter>
    <path class="body" d="M24.183 14.381 24.129 25.291 17.578 25.183 17.47 19.39 11.081 19.444 10.919 25.129 4.097 25.075 3.935 16.167C5.613 15.951 8.536 15.463 9.349 13.839 12.056 17.845 17.632 17.25 19.527 12.756 20.826 13.406 22.18 14.381 24.129 14.381" stroke="black" stroke-width="1.5" fill="none" filter="url(#scribble)"/>
    <path class="head"  d="M4.572-.183C6.1417.2987 7.251.708 9.854.944 11.509.8587 13.39.8983 15.271.938 17.166.918 18.243.659 20.018.02 23.6 2.286 25.925 5.423 27.007 8.614 28.846 17.052 21.706 14.077 19.858 12.231L15.256.923 19.894 12.213C17.379 18.891 11.051 17.214 9.699 13.428L9.832.956 9.733 13.415C4.079 18.493-.984 15.04.331 10.273 1.317 6.854 2.106 4.519 5.032-.314" stroke="white" stroke-width="1.5" fill="none" filter="url(#scribble)"/>
  </svg>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'currentColor',
  },
});
</script>
