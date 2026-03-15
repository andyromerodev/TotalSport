import type { Product, StoreMeta } from './catalog.types';

export interface ICatalogRepository {
  getStores(): StoreMeta[];
  /** Devuelve productos ya enriquecidos con stock (todos, incluyendo inactive). */
  getProductsByStore(storeSlug: string): Product[];
}

export interface IStockRepository {
  getStockMap(): Map<string, { inStock: boolean; availableQty?: number }>;
}
