import type { ICatalogRepository } from '../domain/catalog.repository';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreProducts } from './getStoreProducts';

export function getStoreCategories(
  slug: string,
  repo: ICatalogRepository = jsonCatalogRepository
): string[] {
  return [...new Set(getStoreProducts(slug, repo).map((product) => product.category))];
}
