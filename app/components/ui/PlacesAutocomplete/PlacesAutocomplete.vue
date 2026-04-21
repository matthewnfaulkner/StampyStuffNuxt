<template>
  <div>

    <USelectMenu
        :items="suggestions"
        icon="i-lucide-house"
        placeholder="Begin typing address..."
        label-key="description"

        class="w-full bg-white dark:bg-black max-w-1/1 text-wrap h-10 border-1"
        v-model:search-term="value"
        ignore-filter
        @update:model-value="handleSelect($event)"
        :ui="{
            value: 'text-wrap',

        }"
    >   
    </USelectMenu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePlacesAutocomplete, geocodeByPlaceId } from 'vue-use-places-autocomplete'

const emit = defineEmits(['update:modelValue']);

export type AddressComponent = {
    long_name: string
    short_name: string
    types: string[]
}

const props = defineProps<{
    restrictCountryTo: string[];
}>();
const value = ref('');
// usePlacesAutocomplete is auto-imported by Nuxt if installed correctly
const { suggestions, loading, refreshSessionToken }  = usePlacesAutocomplete(value, {
    autocompletionRequest: {
        componentRestrictions: {
            country: props.restrictCountryTo
        }
    },
  // Optional configuration options go here
  // e.g., apiOptions: { types: ['address'], componentRestrictions: { country: 'us' } }
  debounce: 500
});


const handleSelect = async (prediction) => {
    
    const results = await geocodeByPlaceId(prediction.place_id )

    const result = results[0]
    console.log(result);
    if(result.address_components instanceof Array) {
        const addressComponents = result.address_components.map((component: AddressComponent) => ({
            types: component.types,
            long_name: component.long_name,
            short_name: component.short_name
        }))

        emit('update:modelValue', addressComponents);
    }
    
};
</script>
