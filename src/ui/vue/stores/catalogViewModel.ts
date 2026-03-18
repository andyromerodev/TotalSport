import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ProductDetailUiState, StoreCatalogUiState, StoreCardUiState } from '../types/catalogUiState';

// Pinia Store = state holder global reactivo.
// Equivalente Android: ViewModel + StateFlow (scope de app/pantalla segun uso).
export const useCatalogViewModel = defineStore('catalog-ui', () => {
  // ref(...) equivale a mutableStateOf / MutableStateFlow para un valor puntual.
  const homeStoreCardsUiState = ref<StoreCardUiState[]>([]);
  const storeCatalogUiState = ref<StoreCatalogUiState | null>(null);
  const productDetailUiState = ref<ProductDetailUiState | null>(null);

  function loadHomeUiState(cards: StoreCardUiState[]) {
    homeStoreCardsUiState.value = cards;
  }

  function loadStoreCatalogUiState(payload: StoreCatalogUiState) {
    storeCatalogUiState.value = payload;
  }

  function loadProductDetailUiState(payload: ProductDetailUiState) {
    productDetailUiState.value = payload;
  }

  // computed(...) equivale a derivedStateOf / transformacion derivada de estado.
  const hasHomeStoreCards = computed(() => homeStoreCardsUiState.value.length > 0);
  const hasSelectedProducts = computed(() => (storeCatalogUiState.value?.selectedProducts.length ?? 0) > 0);

  return {
    homeStoreCardsUiState,
    storeCatalogUiState,
    productDetailUiState,
    hasHomeStoreCards,
    hasSelectedProducts,
    loadHomeUiState,
    loadStoreCatalogUiState,
    loadProductDetailUiState,
  };
});
