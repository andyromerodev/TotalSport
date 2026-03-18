import type { Product, StoreMeta } from '../../../domain/catalog.types';
import { getProductImages } from '../../../lib/productImages';
import { slugifyCategory } from '../../../lib/slugify';
import { buildWhatsAppLink } from '../../../lib/whatsapp';
import type {
  ProductCardUiState,
  ProductDetailUiState,
  StoreCatalogUiState,
  StoreThemeUiState,
  StoreCardUiState,
} from '../types/catalogUiState';

// Adapter/Mapper de presentacion:
// Convierte entidades de dominio (Product, StoreMeta) a UiState de UI.
// Equivalente Android: mapper Domain -> UiState usado por ViewModel.
// Regla de arquitectura: la UI no conoce detalles del dominio/repositorio.
const FALLBACK_IMAGE = 'https://placehold.co/900x900?text=Sin+foto';
const DEFAULT_THEME: StoreThemeUiState = { kicker: 'Tienda', accent: '#0a7f52', soft: '#d8f1e7' };

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function toStoreCardUiState(
  store: StoreMeta,
  count: number,
  baseUrl: string,
  options?: {
    coverImageUrl?: string;
    coverSrcSet?: string;
    coverSizes?: string;
    coverLoading?: 'lazy' | 'eager';
    coverFetchPriority?: 'auto' | 'high' | 'low';
    theme?: StoreThemeUiState;
  }
): StoreCardUiState {
  const normalizedBase = normalizeBaseUrl(baseUrl);

  return {
    slug: store.slug,
    title: store.title,
    description: store.description,
    count,
    href: `${normalizedBase}tienda/${store.slug}/`,
    coverImageUrl: options?.coverImageUrl,
    coverSrcSet: options?.coverSrcSet,
    coverSizes: options?.coverSizes,
    coverLoading: options?.coverLoading ?? 'lazy',
    coverFetchPriority: options?.coverFetchPriority ?? 'auto',
    theme: options?.theme ?? DEFAULT_THEME,
  };
}

export function toProductCardUiState(product: Product, baseUrl: string): ProductCardUiState {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const coverImage = getProductImages(product)[0] ?? FALLBACK_IMAGE;

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    priceUsd: product.priceUsd,
    description: product.description,
    inStock: product.inStock,
    detailsHref: `${normalizedBase}productos/${product.id}/`,
    whatsappHref: buildWhatsAppLink(product.name),
    coverImage,
  };
}

export function toStoreCatalogUiState(input: {
  store: StoreMeta;
  categories: string[];
  selectedCategory?: string;
  selectedProducts: Product[];
  baseUrl: string;
  routeSegment?: 'tienda' | 'coleccion';
  storePathSlug?: string;
}): StoreCatalogUiState {
  const normalizedBase = normalizeBaseUrl(input.baseUrl);

  // Permite reutilizar la misma UI en rutas nuevas (/tienda) y legacy (/coleccion)
  // sin duplicar componentes.
  const routeSegment = input.routeSegment ?? 'tienda';
  const storePathSlug = input.storePathSlug ?? input.store.slug;

  return {
    storeSlug: input.store.slug,
    storeTitle: input.store.title,
    storeDescription: input.store.description,
    categories: input.categories.map((category) => ({
      name: category,
      slug: slugifyCategory(category),
      href: `${normalizedBase}${routeSegment}/${storePathSlug}/categoria/${slugifyCategory(category)}/`,
      isActive: category === input.selectedCategory,
    })),
    selectedCategory: input.selectedCategory,
    selectedProducts: input.selectedProducts.map((product) => toProductCardUiState(product, normalizedBase)),
  };
}

export function toProductDetailUiState(product: Product, baseUrl: string): ProductDetailUiState {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const images = getProductImages(product);

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    priceUsd: product.priceUsd,
    description: product.description,
    inStock: product.inStock,
    variants: product.variants,
    images: images.length ? images : [FALLBACK_IMAGE],
    whatsappHref: buildWhatsAppLink(product.name),
    backHref: normalizedBase,
  };
}
