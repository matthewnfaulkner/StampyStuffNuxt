<script setup lang="ts">
    
</script>
<template>
    <UPageSection class="flex justify-center">
        <BaseHeadline headline="You Did It!" class="m-auto"/>
        <BaseTagline tagline="Item Added to Cart" class="m-auto"/>
        <UButton icon="i-lucide-shopping-cart" label="Go to Checkout" to="/checkout" variant="solid" size="xl" color="secondary" class="m-auto"/>
        <UButton label="Continue Shopping" to="/shop" variant="outline" size="xl" color="secondary" class="m-auto"/>
    </UPageSection>
</template>