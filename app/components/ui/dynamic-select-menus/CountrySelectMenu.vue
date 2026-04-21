<script setup lang="ts">
    
const props = defineProps<{
  allowedCountries: string[];
}>();


const { data: countries, status, execute } = await useLazyFetch<{
  name: string
  code: string
  emoji: string
}[]>('/api/countries.json', {
  immediate: false
})


function onOpen() {
  if (!countries.value?.length) {
    execute().then()
  }
}

const filteredCountries = computed(() => {
  if(props.allowedCountries.length == 0) return countries.value;

   return countries.value?.filter((country) =>
    props.allowedCountries.includes(country.code)
  );
})

const selectedCountry = ref<string | null>(null)

const selectedCountryObject = computed(() =>
  countries.value?.find(c => c.code === selectedCountry.value)
)


</script>

<template>
  <USelectMenu
    :items="filteredCountries"
    v-model="selectedCountry"
    :loading="status === 'pending'"
    label-key="name"
    value-key="code"
    :search-input="{ icon: 'i-lucide-search' }"
    placeholder="Select country"
    class="w-48"
    @update:open="onOpen"
    @update:search-term="selectedCountry = $event"
  >

    <template #item-leading="{ item }">
      <span class="size-5 text-center">
        {{ item.emoji }}
      </span>
    </template>
  </USelectMenu>
</template>

