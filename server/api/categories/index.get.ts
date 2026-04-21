import { z } from 'zod';

const querySchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(6),
    parent: z.coerce.string()
});

export default defineEventHandler(async (event) => {
    
    const query = await getValidatedQuery(event, querySchema.safeParse);

    if (!query.success) {
        throw createError({ statusCode: 400, message: 'Invalid query parameters' });
    }

    const { limit, parent } = query.data;

    try {
        const categoriesPromise = directusServer.request(
            readItems('categories', {
                limit,
                sort: ['title'],
                filter: { _and: [
                    { parent_category: { _null: true } },
                    { is_active : { _eq: true } },
                    { title : { _neq: 'Addons'}}
                    ]
                },
                fields:  [
                        'id',
                        'sort',
                        'title',
                        'is_active',
                        'parent_category',
                    {
                        sub_categories: [
                            'id',
                            'title',
                            'is_active',
                            'parent_category'
                        ]
                    },
                ],
            }),
        );


        const countPromise = directusServer.request(
			readItems('categories', {
				aggregate: { count: '*' },
				filter: { is_active: { _eq: true } },
			}),
		);

		let [categories, count] = await Promise.all([categoriesPromise, countPromise]);

		return {
			categories,
			count: Number(count[0]?.count) || 0,
		};
    } catch {
        throw createError({ statusCode: 500, message: 'Failed to fetch paginated categories' });
    }
});
