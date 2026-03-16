import type { ICatalogRepository } from '../domain/catalog.repository';
import type { Product } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';

export function getStoreProductsUseCase(
  slug: string,
  repo: ICatalogRepository = jsonCatalogRepository
): Product[] {
  return repo.getProductsByStore(slug).filter((product) => product.active);
}
