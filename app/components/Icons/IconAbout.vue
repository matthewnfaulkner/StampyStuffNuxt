<template>
  <svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="-0.879173 -1.314 28 30">
    <defs>
      <filter id="scribble">
        <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="1" />
        <feDisplacementMap in="SourceGraphic" scale=".4" />
      </filter>
    </defs>
    <path class="circle" d="M5 3A1 1 0 0021.01 21.811C35.01 9.773 14.59-6.902 4.966 3.026" fill="none"  stroke-width="1.5" filter="url(#scribble)"/>
    <path class="dot" d="M11.862 6.17A1 1 0 0013.026 4.322 1 1 0 0011.85 6.158" stroke-width=".2" filter="url(#scribble)" fill="white"/>
    <path class="circle" d="M10.643 20.37H15.368L12.866 20.37 12.658 9.668 10.851 10.919" stroke-width="1.5" fill="none" filter="url(#scribble)"/>
    <path class="leaf" d="M3.5972 8.9825C4.9377 8.2036 5.2354 8.1807 6.8394 7.9055 5.3732 10.85 3.8819 11.4313 2.8641 11.2168 2.3025 10.1627 3.3795 9.1773 3.5398 9.017Z" stroke="black" stroke-width="0" fill="none" filter="url(#scribble)"/>
    <path class="flower" d="M5.5505 6.5619C5.6087 3.7281 7.4174 3.8562 7.7942 5.9382 7.5155 5.7102 12.4247 4.8672 9.3458 7.8003 11.5175 8.6382 9.704 11.0727 7.985 9.3753 8.1524 11.2158 5.0969 12.4335 5.6216 8.3997 4.5956 9.2592 1.2782 7.1586 5.0726 6.633Z" stroke-width="0" fill="none" filter="url(#scribble)"/>
    <path class="body" d="M18 15 18.6612 13.452 19.2448 15.0008 20.7512 15.0116 19.5204 16.03 20.2948 17.388 18.8204 16.8256 17.452 17.4832 17.9188 16.0088 16.4864 15.0008" stroke="black" stroke-width="0" fill="none" filter="url(#scribble)"/>
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
