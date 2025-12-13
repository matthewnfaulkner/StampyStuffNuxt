import Aura from '@primeuix/themes/aura';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  colorMode: {
    preference: 'light', // Set to 'light' to disable system preference and force light mode
    fallback: 'light', // Optional: ensure fallback is also light
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@primevue/nuxt-module',
    '@nuxtjs/i18n',
    'nuxt-directus',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  primevue: {
        options: {
            theme: {
                preset: Aura
            }
        }
  },
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: true,
    theme: {
      colors: [
        'primary',
        'secondary',
        'tertiary',
        'info',
        'success',
        'warning',
        'error'
      ],
    }
  },
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      { name:'en', code: 'en', language: 'en-US', file: 'en.json'},
      { name:'my', code: 'ms-MY', language: 'ms-MY', file: 'my.json'},
    ],
    defaultLocale: 'en',
  },
  runtimeConfig: { 
    public: {
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL as string,
            directusUrl: process.env.DIRECTUS_URL as string,
            enableVisualEditing: process.env.NUXT_PUBLIC_ENABLE_VISUAL_EDITING !== 'false',
    },
    directusServerToken: process.env.DIRECTUS_SERVER_TOKEN,
    directusFormToken: process.env.DIRECTUS_FORM_TOKEN
  },
  vue: {
          propsDestructure: true,
  },
  ssr: true,
  // Image Configuration - https://image.nuxt.com/providers/directus
  image: {
          providers: {
                  directus: {
                          provider: 'directus',
                          options: {
                                  baseURL: `${process.env.DIRECTUS_URL}/assets/`,
                          },
                  },
                  local: {
                          provider: 'ipx',
                  },
          },
  },
})