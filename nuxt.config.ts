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
    '@nuxtjs/sitemap',
    'nuxt-directus',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  app: {
    head: {
      script: [
        {
          src: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCLae8FBCNECkSJTkKU29uhtwAHxiKk0j0&libraries=places',
          async: true,
          defer: true
        }
      ]
    }
  },
  routeRules: {
		// Never cache API routes - query params must always hit the server fresh
		'/api/**': { isr: false },   // API always fresh

		// Cache all page routes
		'/**': { isr: 60 },
	},
  scripts: {
    registry: {
      stripe: true,
    }
  },
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
            stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY
    },
    stripeSeceretKey: process.env.STRIPE_SECRET_KEY,
    directusServerToken: process.env.DIRECTUS_SERVER_TOKEN,
    directusFormToken: process.env.DIRECTUS_FORM_TOKEN,
    directusPaymentToken: process.env.DIRECTUS_PAYMENT_TOKEN
  },
  vue: {
          propsDestructure: true,
  },
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
  hooks: {
		async 'prerender:routes'(ctx) {
		// Ensure we only do this during a production build
		if (process.env.NODE_ENV === 'development') return

		const directusUrl = process.env.DIRECTUS_URL;
		const token = process.env.DIRECTUS_PAYMENT_TOKEN // Use a static token if your collections are private

		try {
			console.log('Fetching dynamic routes for prerendering...')

			// 1. Fetch Pages and Posts in parallel via standard fetch
			// (This avoids issues with SDK initialization inside the config file)
			const [pagesRes, postsRes, productRes] = await Promise.all([
			fetch(`${directusUrl}/items/pages?fields=permalink&limit=-1`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {}
			}),
			fetch(`${directusUrl}/items/posts?filter[status][_eq]=published&fields=slug&limit=-1`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {}
			}),
      fetch(`${directusUrl}/items/products?filter[status][_neq]=inactive&fields=slug&limit=-1`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {}
			})
			])

			const pages = await pagesRes.json()
			const posts = await postsRes.json()
      const products = await productRes.json();
			// 2. Format and add Pages
			pages.data?.forEach((page: any) => {
			  const path = page.permalink.startsWith('/') ? page.permalink : `/${page.permalink}`
			  ctx.routes.add(path)
			})

			// 3. Format and add Posts
			posts.data?.forEach((post: any) => {
			ctx.routes.add(`/blog/${post.slug}`)
			})
      
      products.data?.forEach((product: any) => {
			ctx.routes.add(`/shop/${product.slug}`)
			})

			console.log(`Successfully added ${ctx.routes.size} routes to prerender.`)
		} catch (error) {
			console.error('Prerender hook failed:', error)
		}
		}
	},
  sitemap: {
		sources: ['/api/sitemap'],
	},
  nitro: {
		prerender: {
			// This is the most important part:
      crawlLinks: false,

			failOnError: false,
		}
	},
  
})