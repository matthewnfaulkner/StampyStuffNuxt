  import {
    createDirectus,
    rest,
    readItem,
    readItems,
    withToken,
    createItems,
    createItem,
} from "@directus/sdk";
import type { DirectusSchema } from '../../directus';

const directus = createDirectus<DirectusSchema>(
    "http://localhost:8055/",
).with(rest());

export default defineNuxtPlugin(() => {
    return {
        provide: { directus, readItem, readItems, withToken, createItem, createItems },
    };
});
