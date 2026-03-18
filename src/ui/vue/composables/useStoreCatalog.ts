import { computed } from 'vue';
import type { StoreCatalogUiState, StoreCardUiState } from '../types/catalogUiState';
import { useCatalogViewModel } from '../stores/catalogViewModel';

// Dos composables separados para respetar SRP:
// - useHomeCatalog: estado de cards de home.
// - useStoreCatalog: estado de listado por tienda/categoria.
export function useHomeCatalog(initialCards: StoreCardUiState[]) {
  const store = useCatalogViewModel();
  store.loadHomeUiState(initialCards);

  return {
    homeStoreCardsUiState: store.homeStoreCardsUiState,
    hasHomeStoreCards: store.hasHomeStoreCards,
  };
}

export function useStoreCatalog(initialCatalog: StoreCatalogUiState) {
  const store = useCatalogViewModel();
  store.loadStoreCatalogUiState(initialCatalog);

  return {
    storeCatalogUiState: computed(() => store.storeCatalogUiState),
    hasSelectedProducts: computed(() => store.hasSelectedProducts),
  };
}
