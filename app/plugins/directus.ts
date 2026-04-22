  import {
    createDirectus,
    rest,
    readItem,
    readItems,
    withToken,
    createItems,
    createItem,
} from "@directus/sdk";
import type { Schema }  from '#shared/types/schema'  ;



export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const directus = createDirectus<Schema>(
        config.public.directusUrl,
    ).with(rest());

    return {
        provide: { directus, readItem, readItems, withToken, createItem, createItems },
    };
});
