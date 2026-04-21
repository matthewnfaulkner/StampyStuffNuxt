export default defineEventHandler(async (event) => {
	try {
		const [globals, shopSettings, headerNavigation, footerNavigation] = await Promise.all([
			directusServer.request(
				readSingleton('globals', {
					fields: ['title', 'description', 'logo', 'logo_dark_mode', 'social_links', 'accent_color', 'favicon'],
				}),
			),
			directusServer.request(
				readSingleton('shop_settings', {
					fields: [
						'enabled', 
						'shop_closed_message', 
						'shipping_countries', 
						'shipping_fees',
						'payment_success_heading',
						'payment_success_message',
						'payment_failed_heading',
						'payment_failed_message',
						'seo',
						{
							reminder_form: [
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
						}
					],
				}),
			),
			directusServer.request(
				readItem('navigation', 'main', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								'url',
								'type',
								{
									page: ['id', 'permalink'],
									post: ['id', 'slug'],
									children: ['id', 'title', 'url', 'type', {
										page: ['id', 'permalink'],
										post: ['id', 'slug']
									}],
								},
							],
						},
					],
					deep: {
						items: {
							_sort: ['sort'],
							children: {
								_sort: ['sort'],
							},
						},
					},
				}),
			),

			directusServer.request(
				readItem('navigation', 'footer', {
					fields: [
						'id',
						'title',
						{
							items: [
								'id',
								'title',
								'url',
								'type',
								{
									page: ['id', 'permalink'],
									post: ['id', 'slug'],
									children: ['id', 'title', 'url', 'type', {
										page: ['id', 'permalink'],
										post: ['id', 'slug']
									}],
								},
							],
						},
					],
					deep: {
						items: {
							_sort: ['sort'],
							children: {
								_sort: ['sort'],
							},
						},
					},
				}),
			),
		]);

		return { globals, shopSettings, headerNavigation, footerNavigation };
	} catch {
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
	}
});
