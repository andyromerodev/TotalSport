import type { ICatalogRepository } from '../domain/catalog.repository';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreProductsUseCase } from './GetStoreProductsUseCase';

export function getStoreCategoriesUseCase(
  slug: string,
  repo: ICatalogRepository = jsonCatalogRepository
): string[] {
  return [...new Set(getStoreProductsUseCase(slug, repo).map((product) => product.category))];
}
