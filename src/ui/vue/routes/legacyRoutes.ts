import { getStoresUseCase, getStoreBySlugUseCase } from '../../../application/GetStoresUseCase';
import { getStoreCategoriesUseCase } from '../../../application/GetStoreCategoriesUseCase';
import { getStoreProductsByCategoryUseCase } from '../../../application/GetStoreProductsByCategoryUseCase';
import { findStoreSlugByCategorySlugUseCase } from '../../../application/FindStoreByCategoryUseCase';
import { slugifyCategory } from '../../../lib/slugify';
import { normalizeBaseUrl, toStoreCatalogUiState } from '../adapters/catalogViewModelMappers';
import type { StoreMeta } from '../../../domain/catalog.types';
import type { StoreCatalogUiState } from '../types/catalogUiState';

// /coleccion/[group] maps legacy group slugs to current store slugs.
const LEGACY_GROUP_TO_STORE: Record<string, string> = {
  'deporte-ciclismo': 'deportes'
};

function resolveStoreFromGroup(legacyGroup: string): string {
  return LEGACY_GROUP_TO_STORE[legacyGroup] ?? legacyGroup;
}

export function getLegacyGroupStaticPaths() {
  const stores = getStoresUseCase().map((store) => store.slug);
  const legacy = stores.map((slug) => (slug === 'deportes' ? 'deporte-ciclismo' : slug));
  return legacy.map((group) => ({ params: { group } }));
}

export function getLegacyGroupPageData(
  legacyGroup: string,
  rawBaseUrl: string
): { store: StoreMeta; catalog: StoreCatalogUiState } {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const mappedStore = resolveStoreFromGroup(legacyGroup);
  const store = getStoreBySlugUseCase(mappedStore) ?? getStoresUseCase()[0];
  const categories = getStoreCategoriesUseCase(store.slug);
  const selectedCategory = categories[0];
  const selectedProducts = selectedCategory
    ? getStoreProductsByCategoryUseCase(store.slug, selectedCategory)
    : [];
  const catalog = toStoreCatalogUiState({
    store,
    categories,
    selectedCategory,
    selectedProducts,
    baseUrl,
    routeSegment: 'coleccion',
    storePathSlug: legacyGroup === 'deporte-ciclismo' ? 'deporte-ciclismo' : store.slug
  });
  return { store, catalog };
}

export function getLegacyGroupCategoryStaticPaths() {
  const paths = [];
  for (const store of getStoresUseCase()) {
    const legacyGroupSlug = store.slug === 'deportes' ? 'deporte-ciclismo' : store.slug;
    for (const storeCategory of getStoreCategoriesUseCase(store.slug)) {
      paths.push({
        params: {
          group: legacyGroupSlug,
          category: slugifyCategory(storeCategory)
        }
      });
    }
  }
  return paths;
}

export function getLegacyGroupCategoryPageData(
  legacyGroup: string,
  categorySlug: string,
  rawBaseUrl: string
): { store: StoreMeta; selectedCategory: string | undefined; catalog: StoreCatalogUiState } {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const mappedStore = resolveStoreFromGroup(legacyGroup);
  const store = getStoreBySlugUseCase(mappedStore) ?? getStoresUseCase()[0];
  const categories = getStoreCategoriesUseCase(store.slug);
  const selectedCategory =
    categories.find((category) => slugifyCategory(category) === categorySlug) ?? categories[0];
  const selectedProducts = selectedCategory
    ? getStoreProductsByCategoryUseCase(store.slug, selectedCategory)
    : [];
  const catalog = toStoreCatalogUiState({
    store,
    categories,
    selectedCategory,
    selectedProducts,
    baseUrl,
    routeSegment: 'coleccion',
    storePathSlug: legacyGroup === 'deporte-ciclismo' ? 'deporte-ciclismo' : store.slug
  });
  return { store, selectedCategory, catalog };
}

export function getLegacyCategoryRedirectStaticPaths() {
  const slugs = new Set<string>();
  for (const store of getStoresUseCase()) {
    for (const category of getStoreCategoriesUseCase(store.slug)) {
      slugs.add(slugifyCategory(category));
    }
  }
  return [...slugs].map((slug) => ({ params: { slug } }));
}

export function getLegacyCategoryRedirectTarget(categorySlug: string, rawBaseUrl: string): string {
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
  const storeSlug = findStoreSlugByCategorySlugUseCase(categorySlug) ?? 'deportes';
  return `${baseUrl}tienda/${storeSlug}/categoria/${categorySlug}/`;
}
