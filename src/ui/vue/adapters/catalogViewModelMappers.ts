import type { Product, StoreMeta } from '../../../domain/catalog.types';
import { getProductImages } from '../../../lib/productImages';
import { slugifyCategory } from '../../../lib/slugify';
import { buildWhatsAppLink } from '../../../lib/whatsapp';
import type {
  ProductCardVM,
  ProductDetailVM,
  StoreCatalogVM,
  StoreThemeVM,
  StoreVM,
} from '../types/catalogViewModels';

const FALLBACK_IMAGE = 'https://placehold.co/900x900?text=Sin+foto';
const DEFAULT_THEME: StoreThemeVM = { kicker: 'Tienda', accent: '#0a7f52', soft: '#d8f1e7' };

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function toStoreCardVM(
  store: StoreMeta,
  count: number,
  baseUrl: string,
  options?: {
    coverImageUrl?: string;
    coverSrcSet?: string;
    coverSizes?: string;
    coverLoading?: 'lazy' | 'eager';
    coverFetchPriority?: 'auto' | 'high' | 'low';
    theme?: StoreThemeVM;
  }
): StoreVM {
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

export function toProductCardVM(product: Product, baseUrl: string): ProductCardVM {
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

export function toStoreCatalogVM(input: {
  store: StoreMeta;
  categories: string[];
  selectedCategory?: string;
  selectedProducts: Product[];
  baseUrl: string;
  routeSegment?: 'tienda' | 'coleccion';
  storePathSlug?: string;
}): StoreCatalogVM {
  const normalizedBase = normalizeBaseUrl(input.baseUrl);
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
    selectedProducts: input.selectedProducts.map((product) => toProductCardVM(product, normalizedBase)),
  };
}

export function toProductDetailVM(product: Product, baseUrl: string): ProductDetailVM {
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
