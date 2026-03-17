<script setup lang="ts">
import type { ProductCardVM } from '../types/catalogViewModels';

defineProps<{ product: ProductCardVM }>();
</script>

<template>
  <article class="card">
    <a class="image-link" :href="product.detailsHref">
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
      <p v-if="!product.inStock" class="stock-badge">Agotado</p>
      <h3>{{ product.name }}</h3>
      <p class="price">{{ product.priceUsd }} USD</p>
      <p v-if="product.description" class="description">{{ product.description }}</p>

      <div class="actions">
        <a class="btn btn-outline" :href="product.detailsHref">Ver detalle</a>
        <a class="btn" :href="product.whatsappHref" target="_blank" rel="noreferrer">
          {{ product.inStock ? 'WhatsApp' : 'Consultar reposicion' }}
        </a>
      </div>
    </div>
  </article>
</template>
