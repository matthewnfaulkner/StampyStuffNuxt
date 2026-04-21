<script setup lang="ts">
import { ZoomIn, ArrowLeft, ArrowRight, X } from 'lucide-vue-next';
import DirectusImage from '../shared/DirectusImage.vue';
interface GalleryItem {
	image: string;
}

interface GalleryProps {
	data: string[];
}

const props = defineProps<GalleryProps>();

const isLightboxOpen = ref(false);
const currentIndex = ref(0);

const sortedItems = computed(() => {
	if (!props.data) return [];
	return [...props.data];
});

const currentItem = computed(() => {
	if (!sortedItems.value.length || currentIndex.value < 0 || currentIndex.value >= sortedItems.value.length) {
		return null;
	}

	return sortedItems.value[currentIndex.value];
});

function handleOpenLightbox(index: number) {
	if (index >= 0 && index < sortedItems.value.length) {
		currentIndex.value = index;
		isLightboxOpen.value = true;
	}
}

function handlePrev() {
	if (!sortedItems.value.length) return;
	currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : sortedItems.value.length - 1;
}

function handleNext() {
	if (!sortedItems.value.length) return;
	currentIndex.value = currentIndex.value < sortedItems.value.length - 1 ? currentIndex.value + 1 : 0;
}

function handleKeyDown(e: KeyboardEvent) {
	if (!isLightboxOpen.value) return;
	e.preventDefault();
	e.stopPropagation();

	switch (e.key) {
		case 'ArrowLeft':
			handlePrev();
			break;
		case 'ArrowRight':
			handleNext();
			break;
		case 'Escape':
			isLightboxOpen.value = false;
			break;
	}
}

const counter = ref(1);

const carousel = useTemplateRef('carousel')
const activeIndex = ref(0)

function onClickPrev() {
  activeIndex.value--
}
function onClickNext() {
  activeIndex.value++
}
function onSelect(index: number) {
  activeIndex.value = index
}

function select(index: number) {
  activeIndex.value = index

  carousel.value?.emblaApi?.scrollTo(index)
}

const { setAttr } = useVisualEditing();

onMounted(() => {
	window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
        <div>  
            <UCarousel
                ref="carousel"
                v-slot="{ item }"
                :items="sortedItems"
                :prev="{ onClick: onClickPrev }"
                :next="{ onClick: onClickNext }"
                class="w-full mx-auto"
                loop
                :ui="{
                    container: 'max-w-xs sm:max-w-none'
                }"
                @select="onSelect"
            >
                    <div class="relative w-50 m-auto">
                        <SharedDirectusImage 
                            @click="handleOpenLightbox(sortedItems.indexOf(item))"
                            :uuid="item"
                            width="320" height="320"
                            class="rounded-lg object-fit transition-transform duration-300 group-hover:scale-110 m-auto"
                        />
                </div>
            </UCarousel>

            <div class="flex gap-1 justify-center pt-4 max-w-xs mx-auto ">
            <div
                v-for="(item, index) in [...sortedItems]"
                :key="index"
                class="size-20 opacity-25 hover:opacity-100 transition-opacity"
                :class="{ 'opacity-100': activeIndex === index }"
                @click="select(index)"
            >
                <SharedDirectusImage :uuid="item"/>
            </div>
            </div>
        </div>

		<UiDialog v-model:open="isLightboxOpen">
			<UiDialogContent
				class="flex max-w-full max-h-full items-center justify-center p-2 bg-transparent border-none z-50"
				hideCloseButton
			>
				<UiDialogTitle class="sr-only">Gallery Image</UiDialogTitle>
				<UiDialogDescription class="sr-only">
					Viewing image {{ currentIndex + 1 }} of {{ sortedItems.length }}.
				</UiDialogDescription>
				<UiDialogHeader />

				<div class="relative w-[90vw] h-[90vh] flex items-center justify-center">
					<DirectusImage
						v-if="currentItem"
						:uuid="currentItem"
						:alt="`Gallery item ${currentItem}`"
						class="size-full object-contain"
					/>
				</div>

				<div v-if="sortedItems.length > 1" class="absolute bottom-4 inset-x-0 flex justify-between px-4">
					<button
						class="flex items-center gap-2 text-white bg-black bg-opacity-70 rounded-full px-4 py-2 hover:bg-opacity-90"
						@click="handlePrev"
					>
						<ArrowLeft class="w-8 h-8" />
						<span>Prev</span>
					</button>
					<button
						class="flex items-center gap-2 text-white bg-black bg-opacity-70 rounded-full px-4 py-2 hover:bg-opacity-90"
						@click="handleNext"
					>
						<span>Next</span>
						<ArrowRight class="w-8 h-8" />
					</button>
				</div>
				<UiDialogClose asChild>
					<button
						class="absolute top-4 right-4 bg-black bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
						aria-label="Close Lightbox"
					>
						<X class="w-8 h-8" />
					</button>
				</UiDialogClose>
			</UiDialogContent>
		</UiDialog>
</template>
