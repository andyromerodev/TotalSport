import type { IStockRepository } from '../domain/catalog.repository';
import publicStockData from '../data/public-stock.json';

const stockMap = new Map(
  (publicStockData as { productId: string; inStock: boolean; availableQty?: number }[]).map(
    (entry) => [entry.productId, entry]
  )
);

export const jsonStockRepository: IStockRepository = {
  getStockMap: () => stockMap,
};
