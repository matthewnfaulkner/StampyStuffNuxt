<script setup lang="ts">
import type { PhoneObject } from 'vue-tel-input';

const props = defineProps<{
	modelValue: string
	class?: string;
}>();

const emits = defineEmits(['update:modelValue']);

const state = ref({
    number: props.modelValue,
    dialCode: ''
})

const processDialCode = () => {
    let number = state.value.number;
    const dialCode = state.value.dialCode;

    if(number.startsWith(dialCode)) {
        number = number.slice(dialCode.length).trimStart();
    }

    emits('update:modelValue', `${dialCode} ${number}`);
}

</script>

<template>
    <vue-tel-input 
        
        validCharactersOnly 
        defaultCountry="MY" 
        required 
        name='phone' 
        @on-input="processDialCode"
        v-model="state.number" 
        @country-changed="state.dialCode = `+${$event.dialCode}`"
        :input-options="{
            placeholder: '',
            name: 'phone',
            required: true,
        }"
        class="bg-white dark:bg-black border-black dark:border-white h-10 rounded-2xl" 
        />
</template>
<style>
    .vue-tel-input{
        border-color: black !important;
        border-radius: 5px !important;
        border-width: 1px !important;
    }

    .dark .vue-tel-input{
        border-color: white !important;
    }
</style>