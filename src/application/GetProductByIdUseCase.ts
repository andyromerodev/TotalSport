import type { ICatalogRepository } from '../domain/catalog.repository';
import type { Product } from '../domain/catalog.types';
import { jsonCatalogRepository } from '../infrastructure/jsonCatalogRepository';
import { getAllProductsUseCase } from './GetAllProductsUseCase';

export function getProductByIdUseCase(
  id: string,
  repo: ICatalogRepository = jsonCatalogRepository
): Product | undefined {
  return getAllProductsUseCase(repo).find((product) => product.id === id);
}
