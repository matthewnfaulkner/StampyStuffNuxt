<script setup lang='ts'>
const { $toast } = useNuxtApp();
const emit = defineEmits<{
    (e: 'close'): void
}>();
const cartStore = useCartStore();

</script>

<template>
    <div class="mt-2 space-y-4 text-white">
        <div class="font-Roboto">
            <div class="flex items-center justify-between py-2 font-bold text-black dark:text-white border-b">
                <h1>Shipping</h1>
                <h4 class="text-base text-gray-500 dark-text-gray-300">Calculated at checkout</h4>
            </div>
            <div class="flex items-center justify-between py-2 font-bold text-black dark:text-white border-b">
                <h1>Total</h1>
                <h1 class="font-bold text-black dark:text-white">RM {{ cartStore.totalProductsPrice }}</h1>
            </div>
        </div>
        <div>
            <UButton 
                @click="emit('close')"
                to="/checkout" 
                label="Proceed to checkout" 
                class="w-full font-Roboto bg-secondary hover:bg-secondary-800" />
        </div>
    </div>
</template>