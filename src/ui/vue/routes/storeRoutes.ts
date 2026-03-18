import { getStoresUseCase, getStoreBySlugUseCase } from '../../../application/GetStoresUseCase';
import { getStoreCategoriesUseCase } from '../../../application/GetStoreCategoriesUseCase';
import { getStoreProductsByCategoryUseCase } from '../../../application/GetStoreProductsByCategoryUseCase';
import { normalizeBaseUrl, toStoreCatalogUiState } from '../adapters/catalogViewModelMappers';
import type { StoreMeta } from '../../../domain/catalog.types';
import type { StoreCatalogUiState } from '../types/catalogUiState';

export function getStaticPaths() {
  return getStoresUseCase().map((store) => ({ params: { store: store.slug } }));
}

export function getStorePageData(
  storeSlug: string,
  rawBaseUrl: string
): { store: StoreMeta; catalog: StoreCatalogUiState } {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const store = getStoreBySlugUseCase(storeSlug) ?? getStoresUseCase()[0];
  const categories = getStoreCategoriesUseCase(store.slug);
  const selectedCategory = categories[0];
  const selectedProducts = selectedCategory
    ? getStoreProductsByCategoryUseCase(store.slug, selectedCategory)
    : [];
  const catalog = toStoreCatalogUiState({ store, categories, selectedCategory, selectedProducts, baseUrl });
  return { store, catalog };
}
