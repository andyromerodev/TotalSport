import type { ICatalogRepository } from '../domain/catalog.repository';
import type { Product } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreProducts } from './getStoreProducts';

export function getStoreProductsByCategory(
  slug: string,
  category: string,
  repo: ICatalogRepository = jsonCatalogRepository
): Product[] {
  return getStoreProducts(slug, repo).filter((product) => product.category === category);
}
