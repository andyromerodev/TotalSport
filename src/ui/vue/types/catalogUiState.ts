import type { ProductVariant } from '../../../domain/catalog.types';

// UiState = modelos pensados para render UI.
// Equivalente Android: data classes que consume Compose como estado de pantalla.
// Aqui evitamos que la UI dependa directamente de entidades de dominio crudas.
export type StoreThemeUiState = {
  kicker: string;
  accent: string;
  soft: string;
};

export type StoreCardUiState = {
  slug: string;
  title: string;
  description: string;
  count: number;
  href: string;
  coverImageUrl?: string;
  coverSrcSet?: string;
  coverSizes?: string;
  coverLoading?: 'lazy' | 'eager';
  coverFetchPriority?: 'auto' | 'high' | 'low';
  theme: StoreThemeUiState;
};

export type CategoryNavItemUiState = {
  name: string;
  slug: string;
  href: string;
  isActive: boolean;
};

export type ProductCardUiState = {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  description?: string;
  inStock: boolean;
  detailsHref: string;
  whatsappHref: string;
  coverImage: string;
};

export type StoreCatalogUiState = {
  storeSlug: string;
  storeTitle: string;
  storeDescription: string;
  categories: CategoryNavItemUiState[];
  selectedCategory?: string;
  selectedProducts: ProductCardUiState[];
};

export type ProductDetailUiState = {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  description?: string;
  inStock: boolean;
  variants?: ProductVariant[];
  images: string[];
  whatsappHref: string;
  backHref: string;
};
