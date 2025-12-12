<template>
  <svg xmlns="http://www.w3.org/2000/svg" height="37" viewBox="-0.879173 -1.314 32 25">
    <defs>
      <filter id="scribble">
        <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="1" />
        <feDisplacementMap in="SourceGraphic" scale=".4" />
      </filter>
    </defs>
    <path class="phone" d="M2.4192 4.708C5.9944 1.0523 9.6856-.1328 14.5136-.0992 21.164-.3016 25.9376 1.6328 28.6368 5.2832 30.6152 9.1264 28.276 13.4136 23.7296 10.4672 22.0072 8.7792 23.0464 7.876 19.976 6.652 17.364 5.5576 13.684 4.8824 10.1736 6.4352 7.2824 7.6488 7.964 11.2432 3.2536 11.1144.1776 10.6376-.4288 8.5152 2.3872 4.6592" stroke="black" stroke-width="1.5" fill="none" filter="url(#scribble)"/>
    <path class="phone" d="M23.414 17.571 20.002 10.369C16.97 6.416 11.663 7.336 9.497 10.585L6.626 17.355C4.244 22.553 8.847 22.012 12.042 22.174L18.161 22.282C23.306 22.228 25.742 22.932 23.414 17.571" stroke="black" stroke-width="1.5" fill="none" filter="url(#scribble)"/>
    <path class="body" d="M13.612 20.171A1 1 0 0016.32 11.073L16.266 11.127A1 1 0 0013.612 20.171" stroke="black" stroke-width="1" fill="none" filter="url(#scribble)"/>
    <path class="body" d="M13.991 18.059A1 1 0 0015.616 13.51L15.562 13.347A1 1 0 0013.991 18.113" stroke="black" stroke-width="1" fill="none" filter="url(#scribble)"/>
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
