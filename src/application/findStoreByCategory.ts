import type { ICatalogRepository } from '../domain/catalog.repository';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getStoreCategories } from './getStoreCategories';
import { slugifyCategory } from '../lib/slugify';

export function findStoreSlugByCategorySlug(
  categorySlug: string,
  repo: ICatalogRepository = jsonCatalogRepository
): string | undefined {
  for (const store of repo.getStores()) {
    const match = getStoreCategories(store.slug, repo).find(
      (category) => slugifyCategory(category) === categorySlug
    );
    if (match) return store.slug;
  }
  return undefined;
}
