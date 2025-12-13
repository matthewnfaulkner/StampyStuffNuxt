<script setup lang='ts'>
import { type Product, type ProductVariant } from '#shared/types/schema';

import { useCartStore } from '~/stores/cartStore';
const cartStore = useCartStore();
const { $directus } = useNuxtApp()
const props = defineProps<ProductVariant>();

</script>

<template>
    <div class="flex items-center justify-between">
        <div class="flex items-start space-x-2">
            <UButton outlined>
                <SharedDirectusImage :uuid="props.image"></SharedDirectusImage>
            </UButton>
        </div>
        <div class="space-y-1">
            <div class="flex items-center justify-between w-[70px] h-6 px-1.5 bg-green-500 rounded-full">
                <button type="button" @click="cartStore.removeProductFromCart(props.id)">
                    <Icon name="ph:minus" class="text-sm text-white hover:text-gray-200"/>
                </button>
                <p class="text-sm text-white">{{ cartStore.productQuantity(props.id) }}</p>
                <button type="button" @click="cartStore.addProductToCart(props)">
                    <Icon name="ph:plus" class="text-sm text-white hover:text-gray-200"/>
                </button>
            </div>
        </div>
    </div>

    <UDivider type="solid"  />
</template>