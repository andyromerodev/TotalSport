<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProductDetail } from '../composables/useProductDetail';
import type { ProductDetailUiState } from '../types/catalogUiState';

// defineProps: contrato de entrada del componente.
const props = defineProps<{ product: ProductDetailUiState }>();
const { productDetailUiState } = useProductDetail(props.product);

// ref = estado mutable reactivo local del componente.
// Equivalente Compose: remember { mutableStateOf(...) }.
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const lightboxOpen = ref(false);
const selectedImage = ref('');
const selectedAlt = ref('Imagen de producto');
const dragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragOriginX = ref(0);
const dragOriginY = ref(0);

// computed = estado derivado reactivo.
const vm = computed(() => productDetailUiState.value);
const images = computed(() => vm.value?.images ?? []);
const shareImage = computed(() => images.value[0] ?? 'https://placehold.co/900x900?text=Sin+foto');
const transformStyle = computed(() => `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`);

function openLightbox(src: string, alt: string) {
  selectedImage.value = src;
  selectedAlt.value = alt;
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
  lightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOpen.value = false;
  selectedImage.value = '';
  document.body.style.overflow = '';
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.2, 4);
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.2, 1);
  if (scale.value <= 1) {
    translateX.value = 0;
    translateY.value = 0;
  }
}

function zoomReset() {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  if (event.deltaY < 0) {
    scale.value = Math.min(scale.value + 0.15, 4);
  } else {
    scale.value = Math.max(scale.value - 0.15, 1);
  }

  if (scale.value <= 1) {
    translateX.value = 0;
    translateY.value = 0;
  }
}

function beginDrag(x: number, y: number) {
  if (scale.value <= 1) return;

  dragging.value = true;
  dragStartX.value = x;
  dragStartY.value = y;
  dragOriginX.value = translateX.value;
  dragOriginY.value = translateY.value;
}

function moveDrag(x: number, y: number) {
  if (!dragging.value) return;

  translateX.value = dragOriginX.value + (x - dragStartX.value);
  translateY.value = dragOriginY.value + (y - dragStartY.value);
}

function endDrag() {
  dragging.value = false;
}
</script>

<template>
  <a v-if="vm" :href="vm.backHref" class="back-link">Regresar al catalogo</a>

  <article v-if="vm" class="product-detail">
    <div class="gallery">
      <button
        type="button"
        class="image-trigger"
        :aria-label="`Ver ${vm.name} en pantalla completa`"
        @click="openLightbox(shareImage, vm.name)"
      >
        <img class="main-image blur-up-image is-loaded" :src="shareImage" :alt="vm.name" loading="eager" width="900" height="900" />
      </button>

      <div v-if="images.length > 1" class="thumb-grid">
        <button
          v-for="(image, index) in images.slice(1)"
          :key="`${vm.id}-thumb-${index}`"
          type="button"
          class="image-trigger thumb-trigger"
          :aria-label="`Ver ${vm.name} foto ${index + 2} en pantalla completa`"
          @click="openLightbox(image, `${vm.name} foto ${index + 2}`)"
        >
          <img class="thumb-image blur-up-image is-loaded" :src="image" :alt="`${vm.name} foto ${index + 2}`" loading="lazy" width="300" height="300" />
        </button>
      </div>
    </div>

    <div>
      <p class="eyebrow">{{ vm.category }}</p>
      <h1>{{ vm.name }}</h1>
      <p class="price">{{ vm.priceUsd }} USD</p>
      <p v-if="!vm.inStock" class="stock-badge detail-stock-badge">Agotado</p>
      <p v-if="vm.description" class="description">{{ vm.description }}</p>

      <ul v-if="vm.variants?.length" class="variants">
        <li v-for="variant in vm.variants" :key="variant.name">
          <strong>{{ variant.name }}:</strong> {{ variant.values.join(', ') }}
        </li>
      </ul>

      <a class="btn" :href="vm.whatsappHref" target="_blank" rel="noreferrer">
        {{ vm.inStock ? 'Solicitar por WhatsApp' : 'Consultar reposicion por WhatsApp' }}
      </a>
    </div>
  </article>

  <div v-if="lightboxOpen" class="lightbox is-open" aria-hidden="false" @click.self="closeLightbox">
    <div class="lightbox-toolbar">
      <button type="button" aria-label="Alejar" @click="zoomOut">-</button>
      <button type="button" aria-label="Restablecer zoom" @click="zoomReset">{{ Math.round(scale * 100) }}%</button>
      <button type="button" aria-label="Acercar" @click="zoomIn">+</button>
      <button type="button" aria-label="Cerrar imagen" @click="closeLightbox">Cerrar</button>
    </div>
    <img
      id="lightbox-image"
      :src="selectedImage"
      :alt="selectedAlt"
      :style="{ transform: transformStyle }"
      :data-zoomed="scale > 1"
      :data-dragging="dragging"
      @wheel="handleWheel"
      @mousedown.prevent="beginDrag($event.clientX, $event.clientY)"
      @mousemove="moveDrag($event.clientX, $event.clientY)"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @touchstart.passive="beginDrag($event.touches[0].clientX, $event.touches[0].clientY)"
      @touchmove.passive="moveDrag($event.touches[0].clientX, $event.touches[0].clientY)"
      @touchend="endDrag"
    />
  </div>
</template>
