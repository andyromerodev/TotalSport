import type { ICatalogRepository } from '../domain/catalog.repository';
import type { Product } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreProductsUseCase } from './GetStoreProductsUseCase';

export function getStoreProductsByCategoryUseCase(
  slug: string,
  category: string,
  repo: ICatalogRepository = jsonCatalogRepository
): Product[] {
  return getStoreProductsUseCase(slug, repo).filter((product) => product.category === category);
}
