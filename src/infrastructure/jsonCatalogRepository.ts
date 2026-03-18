import type { ICatalogRepository } from '../domain/catalog.repository';
import type { RawProduct, Product, StoreMeta } from '../domain/catalog.types';
import storesMetaData from '../data/stores/index.json';
import deportesProductsData from '../data/stores/deportes/products.json';
import tecnologiaProductsData from '../data/stores/tecnologia-electronica/products.json';
import regalosProductsData from '../data/stores/regalos/products.json';
import embarazadasProductsData from '../data/stores/embarazadas/products.json';
import { jsonStockRepository } from './jsonStockRepository';
import { resolveImageUrl, resolveImageUrls } from './imageUrlResolver';

function enrichWithStock(storeSlug: string, products: RawProduct[]): Product[] {
  const stockMap = jsonStockRepository.getStockMap();
  return products.map((product) => {
    const stock = stockMap.get(product.id);
    return {
      ...product,
      imageUrl: product.imageUrl ? resolveImageUrl(storeSlug, product.imageUrl) : undefined,
      images: product.images ? resolveImageUrls(storeSlug, product.images) : undefined,
      inStock: stock?.inStock ?? true,
      availableQty: stock?.availableQty,
    };
  });
}

const storeProductsMap: Record<string, Product[]> = {
  deportes: enrichWithStock('deportes', deportesProductsData as RawProduct[]),
  'tecnologia-electronica': enrichWithStock('tecnologia-electronica', tecnologiaProductsData as RawProduct[]),
  regalos: enrichWithStock('regalos', regalosProductsData as RawProduct[]),
  embarazadas: enrichWithStock('embarazadas', embarazadasProductsData as RawProduct[]),
};

export const jsonCatalogRepository: ICatalogRepository = {
  getStores: () => storesMetaData as StoreMeta[],
  getProductsByStore: (slug) => storeProductsMap[slug] ?? [],
};
