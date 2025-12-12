export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'purple',
      tertiary: 'secondary'
    },
    navigationMenu: {
      variants: {
        active: {
          true: {
            link: 'router-link-exact-active'
          }
        }
      }
    },
    pageHero: {
      slots: {
        root: 'relative isolate',
        container: 'flex flex-col lg:grid py-24 sm:py-32 lg:py-40 gap-16 sm:gap-y-24 font-mono ',
        wrapper: '',
        header: '',
        headline: 'mb-4',
        title: 'text-5xl sm:text-7xl text-pretty tracking-tight font-bold text-highlighted text-secondary-800 dark:text-secondary-100 font-sans',
        description: 'text-2xl text-secondary font-mono dark:text-secondary-100',
        body: 'mt-10',
        footer: 'mt-10',
      },
    },
    pageCTA: {
      slots: {
        root: 'relative isolate rounded-xl overflow-hidden',
        container: 'flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16',
        wrapper: '',
        header: '',
        title: 'text-3xl sm:text-4xl text-pretty tracking-tight font-bold text-highlighted',
        description: 'text-base sm:text-lg text-muted',
        body: 'mt-8',
        footer: 'mt-8',
        links: 'flex flex-wrap gap-x-6 gap-y-3'
      },
      variants: {
        orientation: {
          horizontal: {
            container: 'lg:grid-cols-2 lg:items-center',
            description: 'text-pretty'
          },
          vertical: {
            container: '',
            title: 'text-center',
            description: 'text-center text-balance',
            links: 'justify-center'
          }
        },
        reverse: {
          true: {
            wrapper: 'lg:order-last'
          }
        },
        variant: {
          solid: {
            root: 'bg-inverted text-inverted',
            title: 'text-inverted',
            description: 'text-dimmed'
          },
          outline: {
            root: 'bg-default ring ring-default',
            description: 'text-muted'
          },
          soft: {
            root: 'bg-elevated/50',
            description: 'text-toned'
          },
          subtle: {
            root: 'bg-elevated/50 ring ring-default',
            description: 'text-toned'
          },
          naked: {
            description: 'text-muted'
          }
        },
        title: {
          true: {
            description: 'mt-6'
          }
        }
      },
      defaultVariants: {
        variant: 'outline'
      }
    },
    pricingPlans: {
      base: 'flex flex-col lg:gap-y-10 gap-y-20',
      variants: {
        orientation: {
          horizontal: 'grid lg:grid-cols-[repeat(var(--count),minmax(0,1fr))] grid-cols-2',
          vertical: '',
        },

        compact: {
          true: 'gap-x-2 gap-20'
        },
        scale: {
          true: ''
        }
      },
    },
    accordion: {
      slots: {
        root: 'w-half',
        item: 'border-b border-default last:border-b-0',
        header: 'flex',
        trigger: 'group flex-1 flex items-center gap-1.5 font-medium text-sm py-3.5 focus-visible:outline-primary min-w-0',
        content: 'data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out] overflow-hidden focus:outline-none',
        body: 'text-sm pb-3.5',
        leadingIcon: 'shrink-0 size-5',
        trailingIcon: 'shrink-0 size-5 ms-auto group-data-[state=open]:rotate-180 transition-transform duration-200',
        label: 'text-start break-words'
      },
    },
  }
})