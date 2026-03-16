import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { assert, isObject } from '../lib/assert.mjs';

const ROOT_DIR = process.cwd();

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function loadCatalogProducts() {
  const storesPath = path.resolve(ROOT_DIR, 'src/data/stores/index.json');
  const stores = await readJson(storesPath);
  assert(Array.isArray(stores), 'src/data/stores/index.json must be an array.');

  const catalogProducts = [];

  for (const store of stores) {
    assert(isObject(store) && typeof store.slug === 'string', 'Invalid store entry in stores/index.json.');
    const storeProductsPath = path.resolve(ROOT_DIR, `src/data/stores/${store.slug}/products.json`);
    const products = await readJson(storeProductsPath);
    assert(Array.isArray(products), `${storeProductsPath} must be an array.`);

    for (const product of products) {
      if (!isObject(product) || typeof product.id !== 'string') {
        continue;
      }

      catalogProducts.push({
        productId: product.id,
        name: typeof product.name === 'string' ? product.name : product.id,
        category: typeof product.category === 'string' ? product.category : 'Sin categoria',
        priceUsd: typeof product.priceUsd === 'number' ? product.priceUsd : 0,
        active: Boolean(product.active),
        storeSlug: store.slug,
        storeTitle: typeof store.title === 'string' ? store.title : store.slug
      });
    }
  }

  return catalogProducts;
}
