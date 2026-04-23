import type { SitemapUrlInput } from '#sitemap/types';

export default defineSitemapEventHandler(async () => {
	try {
		const pagesPromise = directusServer.request(
			readItems('pages', {
				fields: ['permalink'],
			}),
		);

		const postsPromise = directusServer.request(
			readItems('posts', {
				filter: { status: { _eq: 'published' } },
				fields: ['slug'],
			}),
		);

		const productsPromise = directusServer.request(
			readItems('products', {
				filter: { status: { _neq: 'inactive' } },
				fields: ['slug'],
			}),
		);

		const [pages, posts, products] = await Promise.all([pagesPromise, postsPromise, productsPromise]);

		const pageUrls = pages.map((page) => ({
			loc: `/${page.permalink}`,
		}));

		const postUrls = posts.map((post) => ({
			loc: `/blog/${post.slug}`,
		}));

		const productUrls = products.map((post) => ({
			loc: `/shop/${post.slug}`,
		}));

		return [...pageUrls, ...postUrls, ...productUrls] satisfies SitemapUrlInput[];
	} catch {
		return [];
	}
});
