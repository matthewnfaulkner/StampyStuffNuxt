export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug');

	if (!slug) {
		throw createError({ statusCode: 400, message: 'Slug is required' });
	}

    const query = getQuery(event);

    const { preview, token: rawToken, id } = query;

    // Security: Only accept tokens when preview mode is explicitly enabled
	// This prevents unauthorized access to draft content
	const token = preview === 'true' && rawToken ? String(rawToken) : null;

    try {

        let product: Product;

        const productData = await directusServer.request(
            readItems('products', {
                limit: 1,
                filter: { status: { _eq: 'active' }, slug: { _eq: slug} },
                fields:  [
                        'id',
                        'status',
                        'slug',
                        'title',
                        'description',
                        'thumbnail',
                        'category',
                        'is_addon',
                        'is_custom',
                        {
                            variants: [
                                'id',
                                'price',
                                'size',
                                'description',
                                'image',
                                'color'
                                
                            ]
                        },
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
                                        'max_file_size',
                                        'max_number_files',
                                        'allowed_file_types'
                                    ]
                                }
                            ]
                        },
                        {
                                addons: [
                                    'id',
                                    {
                                        related_products_id: [
                                            'id',
                                            'status',
                                            'slug',
                                            'title',
                                            'description',
                                            'thumbnail',
                                            'category',
                                            'is_addon',
                                            'is_custom',
                                            {
                                                variants: [
                                                    'id',
                                                    'price',
                                                    'size',
                                                    'color',
                                                    'description',
                                                    'image',  
                                                ]
                                            },
                                        ]
                                    }
                                ]
                        }
                ],
                deep: {
                    product_fields : {
                        product_fields_id: {
                            _sort: "sort"
                        }
                    }
                }
            }),
        );

        
        if (!productData.length) {
            throw createError({ statusCode: 404, message: `Post not found: ${slug}` });
        }
        
        product = productData[0] as Product;

        return {
            product,
        };
    } catch {
        throw createError({ statusCode: 500, message: 'Failed to fetch paginated products' });
    }
});
