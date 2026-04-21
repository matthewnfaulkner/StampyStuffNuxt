<script setup lang='ts'>
import { type Product, type ProductVariant } from '#shared/types/schema';
import { disable } from '@directus/visual-editing';

import { useCartStore } from '~/stores/cartStore';
import { type CartItem } from '#shared/types/schema';
import ConfirmationModal from '../ui/modal/ConfirmationModal.vue';
import { useFileStorage } from '~/composables/useFileStorage.client';


const cartStore = useCartStore();
const { deleteFile } = useFileStorage();

const props = defineProps<CartItem>();
const open = ref(false)
const overlay = useOverlay()
const modal = overlay.create(ConfirmationModal)


const removeProductFromCart = async (productId: string) => {
    const quantity = cartStore.productQuantity(productId) || 0;

    if(quantity < 2) {
        const instance = modal.open({
            title: "Remove Item From Cart",
            helpMessage: "Are you sure you want to remove this item from your cart?",
            confirmLabel: "Remove Item"

        })
        
        await instance.result.then((result) => {if(result) cartStore.removeProductFromCart(props.id)});
        

    } else {

        if(props?.isCustom) {
            const item = cartStore.cart.find((item) => item.id === props.id);
            const customisationOptions = item?.customisationFields;
            customisationOptions?.forEach(item => {
                if(item.type == 'file') {
                    if(item.value instanceof Array) {
                        item.value.forEach((fileName) => {
                            deleteFile(fileName)
                        })
                    } else {
                        deleteFile(item.value as string)
                    }
                }
            });
        }
        
        cartStore.removeProductFromCart(props.id);
    }
}
</script>

<template>
    <div class="flex items-center justify-between">
        
        <div class="flex items-start space-x-2">
            <UButton v-if="isCustom" icon="i-lucide-pencil" color="neutral" class="m-auto" variant="ghost" :to="`/shop/${product.slug}/customise?editing=${id}`"/>
            <UButton class="h-20 text-secondary-800 dark:text-secondary-200 bg-transparent hover:bg-transparent">
                <SharedDirectusImage 
                    :uuid="props.image" 
                    class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div>
                    <UBadge v-if="isCustom" label="Custom Item" color="info" size="sm"/>
                <p>
                    {{color}} {{ size }}
                </p>
                </div>
            </UButton>
        </div>
        <div class="space-y-1 flex flex-col items-end">
            <div class="flex items-center justify-between w-[70px] h-6 px-1.5 bg-secondary dark:bg-secondary-200 text-white dark:text-secondary-800 rounded-full">
                <button type="button" @click="removeProductFromCart(props.id)">
                    <Icon v-if="cartStore.productQuantity(props.id) > 1" name="ph:minus" class="text-sm  hover:text-gray-200"/>
                    <Icon v-else name="ph:trash" class="text-sm  hover:text-gray-200"/>
                </button>
                <p class="text-sm">{{ cartStore.productQuantity(props.id) }}</p>
                <button type="button" @click="cartStore.addProductToCart(props)">
                    <Icon name="ph:plus" class="text-sm  hover:text-gray-200"/>
                </button>
                
            </div>
            <UiPrice currency="RM" :amount="price || 0"/>
        </div>
    </div>
    <div v-if="addons" >
        
        <UPageList class=" pt-4 lg:pl-20">
            <UPageCard
                v-for="addon in addons"
                :key="addon.id"
                variant="ghost"
                orientation="horizontal"
                :ui="{
                    container: 'p-1 lg:p-1 lg:grid-cols-1',
                    body: 'w-full'
                }"
                >

                <template #body>
                    
                    <div class="flex justify-between w-full items-center">
                        <UUser :name="addon.product.title" :description="`${addon.color} ${addon.size}`" size="xl" class="relative" >
                            <template #name>
                                <UBadge v-if="isCustom" label="Addon" color="info" size="sm"/>
                                <p>
                                    {{addon.product.title}}
                                </p>
                            </template>
                            <template #avatar >
                                <SharedDirectusImage :uuid="addon?.image" class="h-15 w-15 m-auto"/>
                            </template>
                        </UUser>
                        
                        <UiPrice currency="RM" :amount="addon.price || 0"/>
                    </div>
                </template>
                </UPageCard>
        </UPageList>
    </div>

    <USeparator type="solid"  />
</template>