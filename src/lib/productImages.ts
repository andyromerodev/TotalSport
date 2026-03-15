import type { Product } from '../domain/catalog.types';

export function getProductImages(product: Product): string[] {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  if (product.imageUrl) {
    return [product.imageUrl];
  }

  return [];
}
