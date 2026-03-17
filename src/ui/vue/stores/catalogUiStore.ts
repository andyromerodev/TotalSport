import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ProductDetailVM, StoreCatalogVM, StoreVM } from '../types/catalogViewModels';

export const useCatalogUiStore = defineStore('catalog-ui', () => {
  const storeCards = ref<StoreVM[]>([]);
  const storeCatalog = ref<StoreCatalogVM | null>(null);
  const productDetail = ref<ProductDetailVM | null>(null);

  function hydrateHome(cards: StoreVM[]) {
    storeCards.value = cards;
  }

  function hydrateStoreCatalog(payload: StoreCatalogVM) {
    storeCatalog.value = payload;
  }

  function hydrateProductDetail(payload: ProductDetailVM) {
    productDetail.value = payload;
  }

  const hasStoreCards = computed(() => storeCards.value.length > 0);
  const hasSelectedProducts = computed(() => (storeCatalog.value?.selectedProducts.length ?? 0) > 0);

  return {
    storeCards,
    storeCatalog,
    productDetail,
    hasStoreCards,
    hasSelectedProducts,
    hydrateHome,
    hydrateStoreCatalog,
    hydrateProductDetail,
  };
});
