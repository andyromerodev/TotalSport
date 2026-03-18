import { getStoresUseCase, getStoreBySlugUseCase } from '../../../application/GetStoresUseCase';
import { getStoreCategoriesUseCase } from '../../../application/GetStoreCategoriesUseCase';
import { getStoreProductsByCategoryUseCase } from '../../../application/GetStoreProductsByCategoryUseCase';
import { slugifyCategory } from '../../../lib/slugify';
import { normalizeBaseUrl, toStoreCatalogUiState } from '../adapters/catalogViewModelMappers';
import type { StoreMeta } from '../../../domain/catalog.types';
import type { StoreCatalogUiState } from '../types/catalogUiState';

export function getStaticPaths() {
  return getStoresUseCase().flatMap((store) =>
    getStoreCategoriesUseCase(store.slug).map((category) => ({
      params: {
        store: store.slug,
        category: slugifyCategory(category)
      }
    }))
  );
}

export function getStoreCategoryPageData(
  storeSlug: string,
  categorySlug: string,
  rawBaseUrl: string
): { store: StoreMeta; selectedCategory: string | undefined; catalog: StoreCatalogUiState } {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const store = getStoreBySlugUseCase(storeSlug) ?? getStoresUseCase()[0];
  const categories = getStoreCategoriesUseCase(store.slug);
  const selectedCategory =
    categories.find((category) => slugifyCategory(category) === categorySlug) ?? categories[0];
  const selectedProducts = selectedCategory
    ? getStoreProductsByCategoryUseCase(store.slug, selectedCategory)
    : [];
  const catalog = toStoreCatalogUiState({ store, categories, selectedCategory, selectedProducts, baseUrl });
  return { store, selectedCategory, catalog };
}
