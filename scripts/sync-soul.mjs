import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const storesIndexPath = path.resolve(process.cwd(), 'src/data/stores/index.json');
const soulPath = process.env.SOUL_PATH
  ? path.resolve(process.env.SOUL_PATH)
  : path.resolve(process.cwd(), '../nanobot-local/SOUL.md');

const START_MARKER = '<!-- CATALOG:START -->';
const END_MARKER = '<!-- CATALOG:END -->';

function formatProduct(product) {
  const lines = [`${product.name} — ${product.priceUsd} USD`];

  if (product.variants?.length) {
    for (const variant of product.variants) {
      lines.push(`${variant.name}: ${variant.values.join(', ')}`);
    }
  }

  return lines.join('\n');
}

function buildCatalogText(stores, productsByStore) {
  const blocks = [START_MARKER];

  for (const store of stores) {
    const products = (productsByStore.get(store.slug) ?? []).filter((product) => product.active);
    const byCategory = new Map();

    for (const product of products) {
      const list = byCategory.get(product.category) ?? [];
      list.push(product);
      byCategory.set(product.category, list);
    }

    blocks.push(store.title.toUpperCase());
    blocks.push('');

    for (const [category, list] of byCategory.entries()) {
      blocks.push(category.toUpperCase());
      blocks.push('');
      for (const product of list) {
        blocks.push(formatProduct(product));
        blocks.push('');
      }
    }
  }

  while (blocks.at(-1) === '') {
    blocks.pop();
  }

  blocks.push(END_MARKER);

  return blocks.join('\n');
}

function replaceCatalogBlock(soulText, newCatalogBlock) {
  const startIndex = soulText.indexOf(START_MARKER);
  const endIndex = soulText.indexOf(END_MARKER);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = soulText.slice(0, startIndex).trimEnd();
    const after = soulText.slice(endIndex + END_MARKER.length).trimStart();
    return `${before}\n\n${newCatalogBlock}\n\n${after}`;
  }

  const sectionHeader = 'PRODUCTOS DISPONIBLES';
  const rulesHeader = 'REGLAS GENERALES';
  const sectionStart = soulText.indexOf(sectionHeader);
  const sectionEnd = soulText.indexOf(rulesHeader);

  if (sectionStart === -1 || sectionEnd === -1 || sectionEnd <= sectionStart) {
    throw new Error('No se encontro una seccion valida de catalogo en SOUL.md.');
  }

  const prefix = soulText.slice(0, sectionStart + sectionHeader.length);
  const suffix = soulText.slice(sectionEnd);

  return `${prefix}\n\n${newCatalogBlock}\n\n${suffix}`;
}

async function main() {
  const [storesRaw, soulRaw] = await Promise.all([
    readFile(storesIndexPath, 'utf-8'),
    readFile(soulPath, 'utf-8')
  ]);

  const stores = JSON.parse(storesRaw);
  const productsByStore = new Map();

  for (const store of stores) {
    const storeProductsPath = path.resolve(process.cwd(), `src/data/stores/${store.slug}/products.json`);
    const products = JSON.parse(await readFile(storeProductsPath, 'utf-8'));
    productsByStore.set(store.slug, products);
  }

  const catalogBlock = buildCatalogText(stores, productsByStore);
  const updatedSoul = replaceCatalogBlock(soulRaw, catalogBlock);

  await writeFile(soulPath, `${updatedSoul.trimEnd()}\n`, 'utf-8');

  console.log(`SOUL synchronized at: ${soulPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
