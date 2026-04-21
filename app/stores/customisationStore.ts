
import { useLocalStorage } from '@vueuse/core'
import { type ProductField, type CartItem } from '#shared/types/schema';
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { productFields } from '~/types/fields';
//import { useFileStorage } from '~/composables/useFileStorage.client';
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

type CustomField = {
    id: string,
    name: string,
    type: string,
    value: any
}

type CustomItem = {
    id: string;
    fields: CustomField[];
}


export const useCustomisationStore = defineStore('customisationStore', {
  state: () => ({
    items: {} as Record<string, CustomItem | null>
  }),

  actions: {
    updateItem(productId: string, fields: CustomField[]) {

        const processedFields: CustomField[] = [];

        this.items[productId] = {
            id: productId,
            fields: fields
        }
    },

    clearItem(productId: string) {
      delete this.items[productId]
    }
  },

  persist: true
})