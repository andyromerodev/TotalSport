import type { ICatalogRepository } from '../domain/catalog.repository';
import type { Product } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getAllProducts } from './getAllProducts';

export function getProductById(
  id: string,
  repo: ICatalogRepository = jsonCatalogRepository
): Product | undefined {
  return getAllProducts(repo).find((product) => product.id === id);
}
