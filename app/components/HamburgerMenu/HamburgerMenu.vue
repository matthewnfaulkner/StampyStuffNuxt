<template>
  <SlideMenu
    :width="350"
    :burgerIcon="true"
    :crossIcon="true"
    :closeOnNavigation="true"
  >     <img src="/src/assets/img/logo.png"/>
      <router-link class="menu-item" to="/" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="-0.879173 -1.314 29.19 29.06">
          <filter id="scribble">
  <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="1" />
  <feDisplacementMap in="SourceGraphic" scale=".4" />
</filter>
        <path class="body" d="M24.183 14.381 24.129 25.291 17.578 25.183 17.47 19.39 11.081 19.444 10.919 25.129 4.097 25.075 3.935 16.167C5.613 15.951 8.536 15.463 9.349 13.839 12.056 17.845 17.632 17.25 19.527 12.756 20.826 13.406 22.18 14.381 24.129 14.381" stroke="black" stroke-width="1.5" fill="none" filter="url(#scribble)"/>
        <path class="head"  d="M4.572-.183C6.1417.2987 7.251.708 9.854.944 11.509.8587 13.39.8983 15.271.938 17.166.918 18.243.659 20.018.02 23.6 2.286 25.925 5.423 27.007 8.614 28.846 17.052 21.706 14.077 19.858 12.231L15.256.923 19.894 12.213C17.379 18.891 11.051 17.214 9.699 13.428L9.832.956 9.733 13.415C4.079 18.493-.984 15.04.331 10.273 1.317 6.854 2.106 4.519 5.032-.314" stroke="white" stroke-width="1.5" fill="none" filter="url(#scribble)"/>
        </svg> <span>{{ $t('nav.home') }}</span>
      </router-link>
      <router-link class="menu-item" to="/about">
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
        <span>{{ $t('nav.about') }}</span></router-link>
      <router-link class="menu-item" to="/contact">
        <svg xmlns="http://www.w3.org/2000/svg" height="37" viewBox="-0.879173 -1.314 32 25">
          <defs>
          <filter id="scribble">
            <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="1" />
            <feDisplacementMap in="SourceGraphic" scale=".4" />
          </filter>
          </defs>
          <path class="phone" d="M2.4192 4.708C5.9944 1.0523 9.6856-.1328 14.5136-.0992 21.164-.3016 25.9376 1.6328 28.6368 5.2832 30.6152 9.1264 28.276 13.4136 23.7296 10.4672 22.0072 8.7792 23.0464 7.876 19.976 6.652 17.364 5.5576 13.684 4.8824 10.1736 6.4352 7.2824 7.6488 7.964 11.2432 3.2536 11.1144.1776 10.6376-.4288 8.5152 2.3872 4.6592" stroke="black" stroke-width="1.5
            " fill="none" filter="url(#scribble)"/>
            <path class="phone" d="M23.414 17.571 20.002 10.369C16.97 6.416 11.663 7.336 9.497 10.585L6.626 17.355C4.244 22.553 8.847 22.012 12.042 22.174L18.161 22.282C23.306 22.228 25.742 22.932 23.414 17.571" stroke="black" stroke-width="1.5
            " fill="none" filter="url(#scribble)"/>
            <path class="body" d="M13.612 20.171A1 1 0 0016.32 11.073L16.266 11.127A1 1 0 0013.612 20.171" stroke="black" stroke-width="1
            " fill="none" filter="url(#scribble)"/>
            <path class="body" d="M13.991 18.059A1 1 0 0015.616 13.51L15.562 13.347A1 1 0 0013.991 18.113" stroke="black" stroke-width="1
            " fill="none" filter="url(#scribble)"/>
        </svg>
        <span>{{ $t('nav.contact') }}</span></router-link>
  </SlideMenu>
</template>

<script setup>
import { Reveal as SlideMenu } from 'vue3-burger-menu';
</script>

<style>
div .bm-menu {
    @apply bg-primary text-primary;

    border-right: black solid 3px;
}

nav a {
  display: block;
  padding: 12px 0;
  color: var(--color-primary);
}

nav a:hover {
  color: #07f;
}

.bm-item-list {
    font-size: 2rem!important;
    text-wrap: nowrap;
}

.bm-item-list > * > span:hover {
    color: var(--color-primary);
}

.bm-item-list > * > span {
    color: var(--color-secondary);
}

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
.menu-item.router-link-exact-active span {
  color: yellow;
}

.menu-item:hover svg path.body,
.menu-item.router-link-active svg path.body,
.menu-item.router-link-exact-active svg path.body {
  fill: var(--color-primary);
  stroke: black;
}

.menu-item:hover svg path.head,
.menu-item.router-link-active svg path.head,
.menu-item.router-link-exact-active svg path.head {
  fill: #F54927;
  stroke: black;
}

.menu-item:hover svg path.flower,
.menu-item.router-link-active svg path.flower,
.menu-item.router-link-exact-active svg path.flower {
  fill: #dea1e4;
  stroke: black;
}

.menu-item:hover svg path.leaf,
.menu-item.router-link-active svg path.leaf,
.menu-item.router-link-exact-active svg path.leaf {
  fill: var(--color-text);
  stroke: black;
}

.menu-item:hover svg path.dot,
.menu-item.router-link-active svg path.dot,
.menu-item.router-link-exact-active svg path.dot {
  fill: black;
  stroke: black;
}

.menu-item:hover svg path.circle,
.menu-item.router-link-active svg path.circle,
.menu-item.router-link-exact-active svg path.circle {
  fill: #00eaff;
  stroke: black;
}

.menu-item:hover svg path.line,
.menu-item.router-link-active svg path.line,
.menu-item.router-link-exact-active svg path.line {
  stroke: var(--color-primary);
}

.menu-item:hover svg path.phone,
.menu-item.router-link-active svg path.phone,
.menu-item.router-link-exact-active svg path.phone {
  fill: #80f;
  stroke: black;
}

.bm-burger-button:hover .bm-burger-bars{
      @apply dark:bg-secondary dark:text-white;
    }
</style>
