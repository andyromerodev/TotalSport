<script setup lang="ts">
import type { ProductCardUiState } from '../types/catalogUiState';

// defineProps: declara props de entrada del componente (tipadas en TS).
// Equivalente Android: parametros de un @Composable.
defineProps<{ product: ProductCardUiState }>();
</script>

<template>
  <article class="card">
    <a class="image-link" :href="product.detailsHref">
      <p v-if="!product.inStock" class="stock-badge stock-badge-overlay">Agotado</p>
      <img
        class="blur-up-image is-loaded"
        :src="product.coverImage"
        :alt="product.name"
        loading="lazy"
        width="640"
        height="640"
      />
    </a>

    <div class="card-content">
      <h3>{{ product.name }}</h3>
      <p class="price">{{ product.priceUsd }} USD</p>
      <p v-if="product.description" class="description">{{ product.description }}</p>

      <div class="actions">
        <a class="btn btn-outline" :href="product.detailsHref">Ver detalle</a>
        <a
          class="btn"
          :class="{ 'btn-disabled': !product.inStock }"
          :href="product.inStock ? product.whatsappHref : undefined"
          :aria-disabled="!product.inStock"
          :tabindex="product.inStock ? undefined : -1"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.image-link {
  position: relative;
  display: block;
}

.stock-badge-overlay {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  z-index: 1;
}

.card-content h3 {
  line-height: 1.3;
  min-height: calc(2 * 1.3em);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-disabled {
  pointer-events: none;
  opacity: 0.55;
  cursor: not-allowed;
}

.description {
  line-height: 1.35;
  min-height: calc(2 * 1.35em);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
