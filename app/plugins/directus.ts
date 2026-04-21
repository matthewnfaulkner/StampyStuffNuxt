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

const directus = createDirectus<Schema>(
    "http://localhost:8056/",
).with(rest());

export default defineNuxtPlugin(() => {
    return {
        provide: { directus, readItem, readItems, withToken, createItem, createItems },
    };
});
