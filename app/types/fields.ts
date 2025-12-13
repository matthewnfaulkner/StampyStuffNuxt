/**
 * Page fields configuration for Directus queries
 *
 * This defines the complete field structure for pages including:
 * - Basic page metadata (title, id)
 * - SEO fields for search engine optimization
 * - Complex nested content blocks (hero, gallery, pricing, forms, etc.)
 * - All nested relationships and dynamic content fields
 */
export const pageFields = [
	'title',
	'id',
	{
		// SEO fields for search engine optimization
		seo: ['title', 'meta_description', 'og_image'],
		// Content blocks
		blocks: [
			'id',
			'background',
			'collection', // Type of block (hero, gallery, pricing, etc.)
			'item', // The actual block content
			'sort',
			'hide_block',
			{
				// Different block types with their specific fields:
				item: {
					block_richtext: ['id', 'tagline', 'headline', 'content', 'alignment'],
					block_gallery: ['id', 'tagline', 'headline', { items: ['id', 'directus_file', 'sort'] }],
					block_pricing: [
						'id',
						'tagline',
						'headline',
						'translations.*',
						{
							pricing_cards: [
								'id',
								'sort',
								'title',
								'description',
								'price',
								'badge',
								'features',
								'is_highlighted',
								'translations.*',
								{
									button: ['id', 'label', 'variant', 'url', 'type', { page: ['permalink'] }, { post: ['slug'] }],
								},
							],
						},
					],
					block_hero: [
						'id',
						'tagline',
						'headline',
						'description',
						'layout',
						'image',
						{
							button_group: [
								'id',
								{
									buttons: ['id', 'label', 'variant', 'url', 'type', { page: ['permalink'] }, { post: ['slug'] }],
								},
							],
						},
					],
					block_posts: ['id', 'tagline', 'headline', 'collection', 'limit'],
					block_form: [
						'id',
						'tagline',
						'headline',
						{
							form: [
								'id',
								'title',
								'submit_label',
								'success_message',
								'on_success',
								'success_redirect_url',
								'is_active',
								{
									fields: [
										'id',
										'name',
										'type',
										'label',
										'placeholder',
										'help',
										'validation',
										'width',
										'choices',
										'required',
										'sort',
									],
								},
							],
						},
					],
				},
			},
		],
	},
];

export const productFields = [
    'id',
    'slug',
    'title',
    'description',
	'thumbnail',
	{ images: ['id','file'] },
    {
        variants: [
            'id',
            'price',
            'size',
            'description',
			'image',

            {
                product: [
                    'id',
                    'slug',
                    'title',
                    'description'
                ]
            },
			{
				product_fields: [
					'id',
					{
						product_fields_id: [
							'id',
							'name',
							'type',
							'label',
							'placeholder',
							'help',
							'validation',
							'width',
							'choices',
							'required',
							'sort',
						]
					}
		]
			}
        ]
    }
]

export const productVariantFields = [
    'id',
    'price',
    'size',
    'description',
	'image',
    {
        product: [
            'id',
            'slug',
            'title',
            'description'
        ]
    },
	{
		product_fields: [
			'id',
			{
				product_fields_id: [
					'id',
					'name',
					'type',
					'label',
					'placeholder',
					'help',
					'validation',
					'width',
					'choices',
					'required',
					'sort',
				]
			}
		]
	}
]

export const formFields = [
    'id',
    'title',
    'submit_label',
    'success_message',
    'on_success',
    'success_redirect_url',
    'is_active',
    {
        fields: [
            'id',
            'name',
            'type',
            'label',
            'placeholder',
            'help',
            'validation',
            'width',
            'choices',
            'required',
            'sort',
        ],
    },
]