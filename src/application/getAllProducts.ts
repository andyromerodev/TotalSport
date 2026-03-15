import type { ICatalogRepository } from '../domain/catalog.repository';
import type { Product } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreProducts } from './getStoreProducts';

export function getAllProducts(repo: ICatalogRepository = jsonCatalogRepository): Product[] {
  return repo.getStores().flatMap((store) => getStoreProducts(store.slug, repo));
}
