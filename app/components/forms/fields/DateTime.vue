<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDate } from '@internationalized/date'

const props = defineProps<{
    defaultValue?: string
    label?: string
    width: string | null
    field: string
    required: boolean
    options: Record<string, any> | null
    modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

const fieldWidth = props.width === 'full' ? '100%' : '50%'

const dateTimeValue = computed({
    get() {
        return props.modelValue || props.defaultValue || ''
    },
    set(value) {
        emit('update:modelValue', value)
    }
})
const inputDateRef = useTemplateRef('inputDateRef')


const today = new Date();
const dd = today.getDate();
const mm = today.getMonth() + 1;
const yyyy = today.getFullYear();
const defaultValue = shallowRef(new CalendarDate(yyyy, mm, dd))
const minValue = shallowRef(new CalendarDate(yyyy,mm,dd))
</script>

<template>
    <div :style="'width: ' + fieldWidth + ';'">
        <label for="field">{{ label }}</label>
        <UInputDate ref="inputDateRef" v-model="defaultValue" :min-value="minValue" variant="outline" locale="en-GB">
        <template #trailing>
        <UPopover :reference="inputDateRef?.inputsRef[3]?.$el">
            <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-calendar"
            aria-label="Select a date"
            class="px-0"
            />

            <template #content>
            <UCalendar v-model="defaultValue" class="p-2" />
            </template>
        </UPopover>
        </template>
  </UInputDate>
    </div>
</template>

<style scoped>
input {
    width: 100%;
}
</style>
