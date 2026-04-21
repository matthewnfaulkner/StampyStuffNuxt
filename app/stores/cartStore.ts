
import { useLocalStorage } from '@vueuse/core'
import { type ProductVariant } from '#shared/types/schema';
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)


export const useCartStore = defineStore('cartStore', () => {
    const cart = useLocalStorage<CartItem[]>('cart', []);
    let cartId = useLocalStorage<string>('cartId', crypto.randomUUID());

    // total products in the cart
    const totalCartProducts = computed(() => {
        return cart.value.map(item => item.quantity).reduce((a,b) => a+b);
    });

    const productQuantity = computed(() => (productId: string) => {
        const item = cart.value.find((item) => item.id === productId);
        return item?.quantity || 0;
    });

    // the total price of all the products in the cart
    const totalProductsPrice = computed(() => {
        //@ts-ignore
        return cart.value.reduce((val, product) => val + product.price * product?.quantity + (product.addons? product.addons?.reduce((addonVal, addon) => addonVal + addon.price * 1, 0) : 0), 0).toFixed(2)
    });

    const refreshCart = () => {
        cart.value = [];
        cartId.value = crypto.randomUUID();
    }

    const addProductToCart = (product: ProductVariant, quantity: number = 1) => {
        // check if the product exists in the cart

        const item = cart.value.find((item) => item.id === product.id);
        if (item) {
            if (item.quantity) {
                // if it does exist increase the quantity
                return item.quantity += quantity
            }
        } else {
            // if it does not exist, add the product to the cart as well as the quantity
            cart.value.push({ ...product , quantity: quantity })
        }
        
    };

    const updateProductInCart = (productId: string, product: ProductVariant) => {
        // check if the product exists in the cart

        const index = cart.value.findIndex((item) => item.id === product.id);
        if (index == -1) {
            return false;
        }
        const oldItem = cart.value[index];
        cart.value.splice(index, 1, { ...product, quantity: oldItem?.quantity || 0});
        
    };

    const removeProductFromCart = (productId: string) => {
        // check if the product exists in the cart
        const item = cart.value.find((item) => item.id === productId);

        if (item) {
            // if the product exists in the cart and the quantity is greater than one, we decrease the quantity
            if (item.quantity && item.quantity > 1) {
                return item.quantity--
            } else {
                // if the quantity is less than one, we remove the product from the cart
                
                cart.value = cart.value.filter((item) => item.id !== productId)
            }
        }
    };
    

    return {
        cart,
        cartId,
        totalCartProducts,
        productQuantity,
        totalProductsPrice,
        addProductToCart,
        removeProductFromCart,
        updateProductInCart,
        refreshCart,
    }
},  
{
    persist: true,
})