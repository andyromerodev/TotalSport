import type { ICatalogRepository } from '../domain/catalog.repository';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreCategoriesUseCase } from './GetStoreCategoriesUseCase';
import { slugifyCategory } from '../lib/slugify';

export function findStoreSlugByCategorySlugUseCase(
  categorySlug: string,
  repo: ICatalogRepository = jsonCatalogRepository
): string | undefined {
  for (const store of repo.getStores()) {
    const match = getStoreCategoriesUseCase(store.slug, repo).find(
      (category) => slugifyCategory(category) === categorySlug
    );
    if (match) return store.slug;
  }
  return undefined;
}
