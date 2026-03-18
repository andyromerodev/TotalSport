import { computed } from 'vue';
import type { ProductDetailUiState } from '../types/catalogUiState';
import { useCatalogViewModel } from '../stores/catalogViewModel';

// Composable = funcion reutilizable de logica de UI.
// Equivalente Android: helper de capa presentation o extension que prepara estado para pantalla.
export function useProductDetail(initialProduct: ProductDetailUiState) {
  const store = useCatalogViewModel();

  // Carga el UiState inicial venido del server (Astro SSR) al ViewModel cliente.
  store.loadProductDetailUiState(initialProduct);

  return {
    // Exponemos lectura derivada para mantener API estable del composable.
    productDetailUiState: computed(() => store.productDetailUiState),
  };
}
