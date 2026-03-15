import type { ICatalogRepository } from '../domain/catalog.repository';
import type { RawProduct, Product, StoreMeta } from '../domain/catalog.types';
import storesMetaData from '../data/stores/index.json';
import deportesProductsData from '../data/stores/deportes/products.json';
import tecnologiaProductsData from '../data/stores/tecnologia-electronica/products.json';
import regalosProductsData from '../data/stores/regalos/products.json';
import embarazadasProductsData from '../data/stores/embarazadas/products.json';
import { jsonStockRepository } from './jsonStockRepository';

function enrichWithStock(products: RawProduct[]): Product[] {
  const stockMap = jsonStockRepository.getStockMap();
  return products.map((product) => {
    const stock = stockMap.get(product.id);
    return {
      ...product,
      inStock: stock?.inStock ?? true,
      availableQty: stock?.availableQty,
    };
  });
}

const storeProductsMap: Record<string, Product[]> = {
  deportes: enrichWithStock(deportesProductsData as RawProduct[]),
  'tecnologia-electronica': enrichWithStock(tecnologiaProductsData as RawProduct[]),
  regalos: enrichWithStock(regalosProductsData as RawProduct[]),
  embarazadas: enrichWithStock(embarazadasProductsData as RawProduct[]),
};

export const jsonCatalogRepository: ICatalogRepository = {
  getStores: () => storesMetaData as StoreMeta[],
  getProductsByStore: (slug) => storeProductsMap[slug] ?? [],
};
