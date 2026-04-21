<script setup lang="ts">
const props = defineProps<{
	name: string;
	placeholder: string;
	maxNumberFiles: number;
	maxFileSize: number;
	allowedFileTypes: Array<string>;
}>();

const emits = defineEmits(['update:modelValue']);

let mimetypes = '';

if(props.allowedFileTypes !== undefined) {
	mimetypes = props.allowedFileTypes.join(',');
}

const description = mimetypes + ` (max ${props.maxFileSize}MB)`;
const value = ref<File[]>([])
</script>

<template>
  <UFileUpload
    v-model="value"
    :label="placeholder" 
		layout="grid" 
		class="w-full min-h-48 rounded-2xl" 
		:description="description"
    @change="emits('update:modelValue', value)" 
		:multiple="maxNumberFiles>1" 
    
  >

    <template #files-top="{ open, files }">
      <div v-if="files?.length" class="mb-2 flex items-center justify-between">
        <p class="font-bold">Files ({{ files?.length }})</p>

        <UButton
          icon="i-lucide-plus"
          label="Add more"
          color="neutral"
          variant="outline"
          class="-my-2"
          @click="open()"
        />
      </div>
    </template>
    
  </UFileUpload>

</template>
