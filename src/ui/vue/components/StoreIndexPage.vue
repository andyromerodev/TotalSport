<script setup lang="ts">
import { useHomeCatalog } from '../composables/useStoreCatalog';
import type { StoreCardUiState } from '../types/catalogUiState';

const props = defineProps<{ stores: StoreCardUiState[] }>();
const { homeStoreCardsUiState } = useHomeCatalog(props.stores);
</script>

<template>
  <header class="hero">
    <h1>Tienditas</h1>
    <p class="lead">Explora cada universo de productos por separado para una experiencia rapida y clara.</p>
  </header>

  <section class="collection-grid" aria-label="Tienditas del catalogo">
    <a
      v-for="store in homeStoreCardsUiState"
      :key="store.slug"
      class="collection-card store-card"
      :href="store.href"
      :style="{ '--store-accent': store.theme.accent, '--store-soft': store.theme.soft }"
    >
      <div v-if="store.coverImageUrl" class="store-media">
        <img
          class="store-cover blur-up-image is-loaded"
          :src="store.coverImageUrl"
          :srcset="store.coverSrcSet"
          :sizes="store.coverSizes"
          :alt="store.title"
          :loading="store.coverLoading"
          :fetchpriority="store.coverFetchPriority"
          width="560"
          height="253"
        />
        <div class="store-overlay"></div>
        <span class="store-kicker">{{ store.theme.kicker }}</span>
      </div>
      <div v-else class="collection-empty">Proximamente</div>

      <div class="collection-card-content">
        <h2>{{ store.title }}</h2>
        <p>{{ store.description }}</p>
        <div class="store-meta">
          <span>{{ store.count }} productos</span>
          <span>Entrar</span>
        </div>
      </div>
    </a>
  </section>
</template>
