import type { ProductVariant } from '../../../domain/catalog.types';

export type StoreThemeVM = {
  kicker: string;
  accent: string;
  soft: string;
};

export type StoreVM = {
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
  theme: StoreThemeVM;
};

export type CategoryNavItemVM = {
  name: string;
  slug: string;
  href: string;
  isActive: boolean;
};

export type ProductCardVM = {
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

export type StoreCatalogVM = {
  storeSlug: string;
  storeTitle: string;
  storeDescription: string;
  categories: CategoryNavItemVM[];
  selectedCategory?: string;
  selectedProducts: ProductCardVM[];
};

export type ProductDetailVM = {
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
