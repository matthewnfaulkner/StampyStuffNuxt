
export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug');

	if (!slug) {
		throw createError({ statusCode: 400, message: 'Slug is required' });
	}

    const query = getQuery(event);

    try {
        const producVariantsPromise = directusServer.request(
            readItems('product_variants', {
                limt: 1,
                fields:  [
                    'id',
                    'price',
                    'size',
                    'description',
                    'image',
                    {
                        product: [
                            'id',
                            'status',
                            'slug',
                            'title',
                            'description',
                            'thumbnail',
                            {
                                    product_fields: [

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
                        ],
                        
                    },
                    
                ],
            }),
        );


        const countPromise = directusServer.request(
			readItems('product_variants', {
				aggregate: { count: '*' },
				filter: { product: { _eq: 'published' } },
			}),
		);


       
        let [productVariants] = await Promise.all([producVariantsPromise]);
        return {
            productVariants,
        };
    } catch {
        throw createError({ statusCode: 500, message: 'Failed to fetch paginated products' });
    }
});
