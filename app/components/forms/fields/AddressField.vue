<script setup lang="ts">
import { computed } from 'vue';

import CountrySelectMenu  from '@/components/ui/dynamic-select-menus/CountrySelectMenu.vue'
import * as z from 'zod'

const shopSettingsStore = useShopSettingsStore();
const shopSettings = shopSettingsStore.getShopSettings() as ShopSettings;
const shippableCountries = shopSettings.shipping_countries?.countryCodes;

type AddressSchema = {
    street_number?: string,
    address_line_1?: string,
    address_line_2?: string,
    city?: string,
    country?: string,
    state?: string,
    postcode?: string,
}

const props = defineProps<{
	modelValue: AddressSchema;
	name: string;
	options?: { value: string; text: string }[];
	placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const a = ref(props.modelValue);

const schema = z.object({
    street_number: z.string().min(1, 'Required'),
    address_line_1: z.string(),
    address_line_2: z.string(),
    city: z.string(),
    country: z.string().refine(
    (val) => shippableCountries.includes(val),
    { message: 'Country is not shippable' }
    ),
    state: z.string(),
    postcode: z.string(),
})

const addressMapping = {
    street_number: 'street_number',
    route: 'address_line_1',
    neighborhood: 'address_line_2',
    sublocality: 'address_line_2',
    locality: 'city',
    country: 'country',
    administrative_area_level_1: 'state',
    postal_code: 'postcode'
}

const fillAddress = (addressComponents: AddressComponent[]) => {
  let freshState = {
    street_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    country: '',
    state: '',
    postcode: '',
  }

  addressComponents.forEach((component) => {
    component.types.forEach((type) => {
      const field = addressMapping[type as keyof typeof addressMapping]
      if (!field) return // skip unmapped types
        
      // For fields that can have multiple types (like address_line_2)
      if(field == 'country'){
        freshState[field] = component.short_name
      }
      else if (freshState[field]) {
        freshState[field] += ' ' + component.long_name
      } else {
        freshState[field] = component.long_name
      }
    })
  })

    emit('update:modelValue', {
    ...props.modelValue,
    ...freshState
  })
}


</script>

<template>	
<div></div>
    <UForm :schema="schema" nested :ui="{default: 'bg-black'}">
        <UiPlacesAutocomplete @update:modelValue="fillAddress($event)" :restrict-country-to="shippableCountries" />
        <UFormField label="Street/Unit Number" required>
                <UiInput v-model="modelValue.street_number" name="street_number" class="bg-white dark:bg-black"></UiInput>
        </UFormField>
        <UFormField label="Address Line 1" required>
                <UiInput v-model="modelValue.address_line_1" name="address_line_1" class="bg-white dark:bg-black"></UiInput>
        </UFormField>
        <UFormField label="Address Line 2">
                <UiInput v-model="modelValue.address_line_2" name="address_line_2" class="bg-white dark:bg-black"></UiInput>
        </UFormField>
        <UFormField label="City" required>
                <UiInput v-model="modelValue.city" name="city" class="bg-white dark:bg-black"></UiInput>
        </UFormField>
        <UFormField label="State">
                <UiInput v-model="modelValue.state" name="state" class="bg-white dark:bg-black" ></UiInput>
        </UFormField>
        <UFormField label="Country" class="w-full " name="country" required description="We only ship to these countries.">
            <CountrySelectMenu v-model="modelValue.country" :allowed-countries="shippableCountries"  class="w-full bg-white dark:bg-black border-1 h-10"/>
        </UFormField>
        <UFormField label="Postcode" required>
                <UiInput v-model="modelValue.postcode" name="postcode" class="bg-white dark:bg-black"></UiInput>
        </UFormField>
    </UForm>
</template>
