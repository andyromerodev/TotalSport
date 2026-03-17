import { computed } from 'vue';
import type { ProductDetailVM } from '../types/catalogViewModels';
import { useCatalogUiStore } from '../stores/catalogUiStore';

export function useProductDetail(initialProduct: ProductDetailVM) {
  const store = useCatalogUiStore();
  store.hydrateProductDetail(initialProduct);

  return {
    productDetail: computed(() => store.productDetail),
  };
}
