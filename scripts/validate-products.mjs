import { readFile } from 'node:fs/promises';
import path from 'node:path';

const storesIndexPath = path.resolve(process.cwd(), 'src/data/stores/index.json');

function fail(message) {
  console.error(`Validation error: ${message}`);
  process.exitCode = 1;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRawGitHubUrl(value) {
  return typeof value === 'string' && value.startsWith('https://raw.githubusercontent.com/');
}

/** Acepta filename relativo (ej. "foto.jpg") o URL absoluta de raw.githubusercontent.com */
function isValidImageRef(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  if (isRawGitHubUrl(value)) return true;
  // filename relativo: no empieza con http, tiene extension de imagen
  return !value.startsWith('http') && /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i.test(value);
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

function validateProduct(product, ctx, ids) {
  if (!isObject(product)) {
    fail(`${ctx} must be an object.`);
    return;
  }

  const required = ['id', 'name', 'category', 'priceUsd', 'active'];
  required.forEach((key) => {
    if (!(key in product)) {
      fail(`${ctx} is missing required key: ${key}.`);
    }
  });

  if (typeof product.id !== 'string' || product.id.trim() === '') {
    fail(`${ctx} has invalid id.`);
  }

  if (ids.has(product.id)) {
    fail(`${ctx} duplicates global id: ${product.id}.`);
  }
  ids.add(product.id);

  if (typeof product.name !== 'string' || product.name.trim() === '') {
    fail(`${ctx} has invalid name.`);
  }

  if (typeof product.category !== 'string' || product.category.trim() === '') {
    fail(`${ctx} has invalid category.`);
  }

  if (typeof product.priceUsd !== 'number' || Number.isNaN(product.priceUsd) || product.priceUsd < 0) {
    fail(`${ctx} has invalid priceUsd.`);
  }

  const hasSingleImage = 'imageUrl' in product && isValidImageRef(product.imageUrl);
  const hasImageList = Array.isArray(product.images) && product.images.length > 0;

  if (!hasSingleImage && !hasImageList) {
    fail(`${ctx} must define either imageUrl (raw.githubusercontent.com URL or filename) or images[].`);
  }

  if ('imageUrl' in product && !isValidImageRef(product.imageUrl)) {
    fail(`${ctx} imageUrl must be a raw.githubusercontent.com URL or a relative filename with image extension.`);
  }

  if ('images' in product) {
    if (!Array.isArray(product.images) || product.images.length === 0) {
      fail(`${ctx} images must be a non-empty array when provided.`);
    } else if (product.images.some((image) => !isValidImageRef(image))) {
      fail(`${ctx} images[] contains an invalid entry. Each must be a raw.githubusercontent.com URL or a relative filename.`);
    }
  }

  if (typeof product.active !== 'boolean') {
    fail(`${ctx} has invalid active flag.`);
  }

  if ('variants' in product) {
    if (!Array.isArray(product.variants)) {
      fail(`${ctx} variants must be an array.`);
    } else {
      product.variants.forEach((variant, variantIndex) => {
        if (!isObject(variant)) {
          fail(`${ctx} variant ${variantIndex} must be an object.`);
          return;
        }

        if (typeof variant.name !== 'string' || variant.name.trim() === '') {
          fail(`${ctx} variant ${variantIndex} has invalid name.`);
        }

        if (!Array.isArray(variant.values) || variant.values.some((value) => typeof value !== 'string' || value.trim() === '')) {
          fail(`${ctx} variant ${variantIndex} has invalid values.`);
        }
      });
    }
  }
}

async function main() {
  const stores = await readJson(storesIndexPath);

  if (!Array.isArray(stores) || stores.length === 0) {
    fail('`src/data/stores/index.json` must be a non-empty array.');
    return;
  }

  const slugs = new Set();
  const ids = new Set();
  let totalProducts = 0;

  for (const [storeIndex, store] of stores.entries()) {
    const storeCtx = `Store at index ${storeIndex}`;

    if (!isObject(store)) {
      fail(`${storeCtx} must be an object.`);
      continue;
    }

    if (typeof store.slug !== 'string' || store.slug.trim() === '') {
      fail(`${storeCtx} has invalid slug.`);
      continue;
    }

    if (slugs.has(store.slug)) {
      fail(`${storeCtx} duplicates slug: ${store.slug}.`);
      continue;
    }
    slugs.add(store.slug);

    if (typeof store.title !== 'string' || store.title.trim() === '') {
      fail(`${storeCtx} has invalid title.`);
    }

    if (typeof store.description !== 'string' || store.description.trim() === '') {
      fail(`${storeCtx} has invalid description.`);
    }

    const storeProductsPath = path.resolve(process.cwd(), `src/data/stores/${store.slug}/products.json`);
    const products = await readJson(storeProductsPath);

    if (!Array.isArray(products)) {
      fail(`Store ${store.slug} products file must be an array.`);
      continue;
    }

    for (const [productIndex, product] of products.entries()) {
      validateProduct(product, `Store ${store.slug} product at index ${productIndex}`, ids);
      totalProducts += 1;
    }
  }

  if (process.exitCode === 1) {
    return;
  }

  console.log(`OK: ${stores.length} stores and ${totalProducts} products validated successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
