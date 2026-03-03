import { readFile } from 'node:fs/promises';
import path from 'node:path';

const productPath = path.resolve(process.cwd(), 'src/data/products.json');

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

async function main() {
  const raw = await readFile(productPath, 'utf-8');
  const products = JSON.parse(raw);

  if (!Array.isArray(products) || products.length === 0) {
    fail('`products.json` must be a non-empty array.');
    return;
  }

  const ids = new Set();

  products.forEach((product, index) => {
    const ctx = `Product at index ${index}`;

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
      fail(`${ctx} duplicates id: ${product.id}.`);
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

    const hasSingleImage = 'imageUrl' in product && isRawGitHubUrl(product.imageUrl);
    const hasImageList = Array.isArray(product.images) && product.images.length > 0;

    if (!hasSingleImage && !hasImageList) {
      fail(`${ctx} must define either imageUrl or images[] with raw.githubusercontent.com URLs.`);
    }

    if ('imageUrl' in product && !isRawGitHubUrl(product.imageUrl)) {
      fail(`${ctx} imageUrl must use raw.githubusercontent.com.`);
    }

    if ('images' in product) {
      if (!Array.isArray(product.images) || product.images.length === 0) {
        fail(`${ctx} images must be a non-empty array when provided.`);
      } else if (product.images.some((image) => !isRawGitHubUrl(image))) {
        fail(`${ctx} images[] contains invalid URL. All images must use raw.githubusercontent.com.`);
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
  });

  if (process.exitCode === 1) {
    return;
  }

  console.log(`OK: ${products.length} products validated successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
