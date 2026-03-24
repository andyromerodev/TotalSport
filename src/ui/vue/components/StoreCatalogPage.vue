<script setup lang="ts">
import { computed } from 'vue';
import { useStoreCatalog } from '../composables/useStoreCatalog';
import { useCategoryNavTransition } from '../composables/useCategoryNavTransition';
import ProductCard from './ProductCard.vue';
import type { StoreCatalogUiState } from '../types/catalogUiState';

// Props tipadas que vienen del server render de Astro.
const props = defineProps<{ catalog: StoreCatalogUiState }>();
const { storeCatalogUiState, hasSelectedProducts } = useStoreCatalog(props.catalog);

// computed = estado derivado reactivo (Compose: derivedStateOf).
const view = computed(() => storeCatalogUiState.value);
const showProducts = computed(() => hasSelectedProducts.value);
const useCompactGrid = computed(() => (view.value?.selectedProducts.length ?? 0) <= 2);
const shimmerCardCount = computed(() => {
  const selectedCount = view.value?.selectedProducts.length ?? 0;
  return Math.min(Math.max(selectedCount, 3), 8);
});
const { categoryNavRef, isCategoryTransitioning, isCategoryActive, onCategoryClick } =
  useCategoryNavTransition(view);
</script>

<template>
  <header class="hero">
    <h1>{{ view?.storeTitle }}</h1>
    <p class="lead">{{ view?.storeDescription }}</p>
  </header>

  <section v-if="view && view.categories.length">
    <nav ref="categoryNavRef" class="category-nav" aria-label="Categorias">
      <a
        v-for="category in view.categories"
        :key="category.slug"
        :href="category.href"
        :class="{ 'is-active': isCategoryActive(category) }"
        @click="onCategoryClick($event, category)"
      >
        {{ category.name }}
      </a>
    </nav>

    <section class="category-section">
      <div class="section-head">
        <h2>{{ view.selectedCategory }}</h2>
        <p>{{ view.selectedProducts.length }} productos</p>
      </div>

      <div v-if="isCategoryTransitioning" class="grid shimmer-grid" :class="{ 'grid-compact': useCompactGrid }">
        <article v-for="index in shimmerCardCount" :key="`shimmer-${index}`" class="card shimmer-card">
          <div class="shimmer-media shimmer-block"></div>
          <div class="shimmer-content">
            <span class="shimmer-line shimmer-block shimmer-line-title"></span>
            <span class="shimmer-line shimmer-block shimmer-line-text"></span>
            <span class="shimmer-line shimmer-block shimmer-line-text"></span>
            <span class="shimmer-line shimmer-block shimmer-line-price"></span>
            <div class="shimmer-actions">
              <span class="shimmer-pill shimmer-block"></span>
              <span class="shimmer-pill shimmer-block"></span>
            </div>
          </div>
        </article>
      </div>
      <div v-else-if="showProducts" class="grid" :class="{ 'grid-compact': useCompactGrid }">
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
