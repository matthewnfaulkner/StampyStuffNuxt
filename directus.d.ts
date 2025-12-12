/// <reference types="@directus/extensions/api.d.ts" />
interface DirectusSchema {
    posts: Post[];
    pages: Page[];
	page_translations: PostTranslation[],
	block_pricing_translations: PricingTranslation[],
	block_pricing_card_translations: PricingCardTranslation[],
	post_translations: PageTranslation[],
}

interface Post {
    id: string;
    title: string;
    slug: string;
    image: Image;
    description: string;
    author: string;
    published_at: string;
    sort?: number;
    content?: string;
    seo?: SEOMeta;
}

interface PostTranslation {
    id: number;
    title: string;
    content: string;
    languages_code: string;
    posts_id: number;
}

interface PricingTranslation {
    id: number;
    tagline: string;
    headline: string;
    languages_code: string;
    block_pricing_id: number;
}

interface PricingCardTranslation {
    id: number;
    title: string;
    description: string;
    languages_code: string;
    block_pricing_cards_id: number;
}

interface Image {
    id: string;
    filename_disk: string;
    title: string;
}

interface SEOMeta {
    title: string;
    meta_description: string;
}

interface Block {
    id: string;
    collection: string;
    item?: Hero | RichText | CardGroup | BlockPricing;
}

interface Page {
    title: string;
    slug: string;
    permalink: string;
    blocks?: Block[];
}

interface PageTranslation {
    id: number;
    title: string;
    content: string;
    languages_code: string;
    posts_id: number;
}

interface Button {
    label: string;
    href: string;
    variant: string;
}

interface Card {
    id: number;
    image: string;
    content: string;
}

interface Post {
    id: number;
    title: string;
    content: string;
}

interface Hero {
    headline: string;
    content: string;
    buttons: Button[];
}

interface RichText {
    headline: string;
    content: string;
}

interface CardGroup {
    headline: string;
    content: string;
    group_type: string;
    posts: Post[];
    cards: Card[];
}

interface Card {
    image: string;
    content: string;
}

interface FormField {
	/** @primaryKey */
	id: string;
	/** @description Unique field identifier, not shown to users (lowercase, hyphenated) */
	name?: string | null;
	/** @description Input type for the field */
	type?: 'text' | 'textarea' | 'checkbox' | 'checkbox_group' | 'radio' | 'file' | 'select' | 'hidden' | null;
	/** @description Text label shown to form users. */
	label?: string | null;
	/** @description Default text shown in empty input. */
	placeholder?: string | null;
	/** @description Additional instructions shown below the input */
	help?: string | null;
	/** @description Available rules: `email`, `url`, `min:5`, `max:20`, `length:10`. Combine with pipes example: `email|max:255` */
	validation?: string | null;
	/** @description Field width on the form */
	width?: '100' | '67' | '50' | '33' | null;
	/** @description Options for radio or select inputs */
	choices?: Array<{ text: string; value: string }> | null;
	/** @description Parent form this field belongs to. */
	form?: Form | string | null;
	sort?: number | null;
	/** @description Make this field mandatory to complete. */
	required?: boolean | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
	date_updated?: string | null;
	user_updated?: DirectusUser | string | null;
}

interface BlockPricing {
	/** @primaryKey */
	id: string;
	/** @description Larger main headline for this page section. */
	headline?: string | null;
	/** @description Smaller copy shown above the headline to label a section or add extra context. */
	tagline?: string | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
	date_updated?: string | null;
	user_updated?: DirectusUser | string | null;
	/** @description The individual pricing cards to display. */
	pricing_cards?: BlockPricingCard[] | string[];
}

interface BlockPricingCard {
	/** @primaryKey */
	id: string;
	/** @description Name of the pricing plan. Shown at the top of the card. */
	title?: string | null;
	/** @description Short, one sentence description of the pricing plan and who it is for. */
	description?: string | null;
	/** @description Price and term for the pricing plan. (ie `$199/mo`) */
	price?: string | null;
	/** @description Badge that displays at the top of the pricing plan card to add helpful context. */
	badge?: string | null;
	/** @description Short list of features included in this plan. Press `Enter` to add another item to the list. */
	features?: 'json' | null;
	/** @description The action button / link shown at the bottom of the pricing card. */
	button?: BlockButton | string | null;
	/** @description The id of the pricing block this card belongs to. */
	pricing?: BlockPricing | string | null;
	/** @description Add highlighted border around the pricing plan to make it stand out. */
	is_highlighted?: boolean | null;
    icon?: string;
	sort?: number | null;
	date_created?: string | null;
	user_created?: DirectusUser | string | null;
	date_updated?: string | null;
	user_updated?: DirectusUser | string | null;
}

export interface Product {
    id:          number;
    title:       string;
    price:       number;
	statis:      string;
    description: string;
    category:    Category;
	thumbnail:	 string;
    images:      string[];
    quantity?: number
}

/**
 * Page fields configuration for Directus queries
 *
 * This defines the complete field structure for pages including:
 * - Basic page metadata (title, id)
 * - SEO fields for search engine optimization
 * - Complex nested content blocks (hero, gallery, pricing, forms, etc.)
 * - All nested relationships and dynamic content fields
 */
const pageFields = [
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