export default defineEventHandler(async (event) => {
    
    const query = getQuery(event);

    const { limit, page, subcategories, activeCategory, sort } = query;

    let filterBySubcategory = true

    if(activeCategory === undefined || activeCategory === null){
        filterBySubcategory = false;
    }else{
        if (subcategories === undefined || subcategories === null) {
            filterBySubcategory = true;
        }
    }

    try {
        const productPromise = directusServer.request(
            readItems('products', {
                limit: limit as number,
                page: page as number,
                sort: [sort.value],
                filter: filterBySubcategory ? {
                    _and: [
                    { is_addon: { _eq: false}},
                    {"category" : {
                        "id": {
                            "_or": [
                                {"_in" : subcategories},
                                {"_in" : activeCategory}
                            ]
                            
                        }
                    }}
                ]
                }: { is_addon : { _neq: true}},
                fields:  [
                            'id',
                            'status',
                            'slug',
                            'title',
                            'description',
                            'thumbnail',
                            'sort',
                            'is_addon',
                            'is_custom',
                            {
                                category: [
                                    'id',
                                    'title',
                                    {
                                        parent_category: [
                                            'id',
                                            'title'
                                        ]
                                    }
                                ]
                            },
                            {
                                variants: [
                                    'id',
                                    'price',
                                    'size',
                                    'description',
                                    'image',
                                    'featured',
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
                                        ]
                                    }
                                ]
                            },
                            {
                                addons: [
                                    {
                                        related_products_id: [
                                            'id',
                                            'title'
                                        ]
                                    }
                                ]
                            }
                ],
            }),
        );


        const countPromise = directusServer.request(
			readItems('products', {
				aggregate: { count: '*' },
				filter: filterBySubcategory ? 
                {
                    _and: [
                        { status: { _eq: 'active' } },
                        { "category" : {
                            "id": {
                                "_in" : subcategories
                            }
                        }
                        }
                    ]
                } :
                { status: { _eq: 'active' } },
			}),
		);


        let [products, count] = await Promise.all([productPromise, countPromise]);
        return {
            products,
            count: Number(count[0]?.count) || 0,
        };
    } catch (error){
        throw createError(error);
    }
});
