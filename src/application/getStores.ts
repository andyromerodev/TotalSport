import type { ICatalogRepository } from '../domain/catalog.repository';
import type { StoreMeta } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';

export function getStores(repo: ICatalogRepository = jsonCatalogRepository): StoreMeta[] {
  return repo.getStores();
}

export function getStoreBySlug(
  slug: string,
  repo: ICatalogRepository = jsonCatalogRepository
): StoreMeta | undefined {
  return repo.getStores().find((store) => store.slug === slug);
}
