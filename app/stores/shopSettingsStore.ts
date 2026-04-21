import { defineStore } from 'pinia'

interface ShopSettingsState {
  shopSettings: ShopSettings | {}
}

export const useShopSettingsStore = defineStore('shopSettings', {
  state: (): ShopSettingsState => ({
    shopSettings: {
      enabled: false,
      seo: {},
      shop_closed_message: '',
      shipping_countries: {}
    },
  }),
  actions: {
    getShopSettings(){
      return this.shopSettings;
    },
    setShopSettings(shopSettings: ShopSettings) {
      this.shopSettings = shopSettings
    },
    reset() {
      // Reset state to initial values
      this.shopSettings = {
        enabled: false,
        seo: {},
        shop_closed_message: '',
        shipping_countries: {}
      }
    },
  },
})
