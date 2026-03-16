import type { ICatalogRepository } from '../domain/catalog.repository';
import type { Product } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreProductsUseCase } from './GetStoreProductsUseCase';

export function getAllProductsUseCase(repo: ICatalogRepository = jsonCatalogRepository): Product[] {
  return repo.getStores().flatMap((store) => getStoreProductsUseCase(store.slug, repo));
}
