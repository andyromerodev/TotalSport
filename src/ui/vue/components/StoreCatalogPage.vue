<script setup lang="ts">
import { computed } from 'vue';
import { useStoreCatalog } from '../composables/useStoreCatalog';
import ProductCard from './ProductCard.vue';
import type { StoreCatalogUiState } from '../types/catalogUiState';

// Props tipadas que vienen del server render de Astro.
const props = defineProps<{ catalog: StoreCatalogUiState }>();
const { storeCatalogUiState, hasSelectedProducts } = useStoreCatalog(props.catalog);

// computed = estado derivado reactivo (Compose: derivedStateOf).
const view = computed(() => storeCatalogUiState.value);
const showProducts = computed(() => hasSelectedProducts.value);
const useCompactGrid = computed(() => (view.value?.selectedProducts.length ?? 0) <= 2);
</script>

<template>
  <header class="hero">
    <h1>{{ view?.storeTitle }}</h1>
    <p class="lead">{{ view?.storeDescription }}</p>
  </header>

  <section v-if="view && view.categories.length">
    <nav class="category-nav" aria-label="Categorias">
      <a
        v-for="category in view.categories"
        :key="category.slug"
        :href="category.href"
        :class="{ 'is-active': category.isActive }"
      >
        {{ category.name }}
      </a>
    </nav>

    <section class="category-section">
      <div class="section-head">
        <h2>{{ view.selectedCategory }}</h2>
        <p>{{ view.selectedProducts.length }} productos</p>
      </div>

      <div v-if="showProducts" class="grid" :class="{ 'grid-compact': useCompactGrid }">
        <ProductCard v-for="product in view.selectedProducts" :key="product.id" :product="product" />
      </div>
      <div v-else class="empty-state">
        <h2>Sin productos por ahora</h2>
        <p>Esta categoria esta lista para recibir inventario.</p>
      </div>
    </section>
  </section>

  <section v-else class="empty-state">
    <h2>Sin productos por ahora</h2>
    <p>Esta tiendita esta lista para recibir su inventario.</p>
  </section>
</template>
