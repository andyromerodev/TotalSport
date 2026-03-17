import { computed } from 'vue';
import type { StoreCatalogVM, StoreVM } from '../types/catalogViewModels';
import { useCatalogUiStore } from '../stores/catalogUiStore';

export function useHomeCatalog(initialCards: StoreVM[]) {
  const store = useCatalogUiStore();
  store.hydrateHome(initialCards);

  return {
    storeCards: computed(() => store.storeCards),
    hasStoreCards: computed(() => store.hasStoreCards),
  };
}

export function useStoreCatalog(initialCatalog: StoreCatalogVM) {
  const store = useCatalogUiStore();
  store.hydrateStoreCatalog(initialCatalog);

  return {
    storeCatalog: computed(() => store.storeCatalog),
    hasSelectedProducts: computed(() => store.hasSelectedProducts),
  };
}
