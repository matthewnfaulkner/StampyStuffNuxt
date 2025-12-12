<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '~/stores/cartStore';
import ProductCard from '../Cart/ProductCard.vue';

const cartStore = useCartStore()

const cartLabel = computed(() => 
  cartStore.totalCartProducts.toString()
)

const cartHasProducts = computed(() => (cartStore?.cart?.length ?? 0) > 0)

</script>

<template>
  <USlideover title="Shopping Cart" close-icon="i-lucide-arrow-right">
    <div class="relative inline-block">
      <UButton 
        icon="i-lucide-shopping-cart" 
        color="tertiary" 
        variant="ghost"
        :label="cartHasProducts ? cartLabel : ''"
        :ui="{
            leadingIcon: 'text-white',
            label: 'bg-primary rounded-full w-5 text-black font-sans'
        }"
      >
      </UButton>

    </div>

    <template #body="{ close }">
      <div v-if="!cartHasProducts" class="grid w-full min-h-screen place-items-center">
        Cart is Empty
      </div>
      <div v-else class="flex flex-col justify-between h-full">
        <div class="overflow-y-scroll">
          <div v-for="cartProduct in cartStore.cart ?? []" :key="cartProduct.id">
                {{ cartProduct.size }}
                <ProductCard
                    :id="cartProduct.id"
                    :price="cartProduct.price"
                    :product="cartProduct.product"
                    :size="cartProduct.size"
                    :image="cartProduct.image"
                />
                </div>
                    <CartProductPaymentDetails @close="close"/>
        </div>
      </div>
    </template>
    <template #footer="{ close }">
      <UButton label="Keep Shopping" color="neutral" variant="outline" @click="close" />
    </template>
  </USlideover>
</template>