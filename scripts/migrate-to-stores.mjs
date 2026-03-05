import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const legacyProductsPath = path.resolve(root, 'src/data/products.json');
const legacyBackupPath = path.resolve(root, 'src/data/products.legacy.json');
const storesDir = path.resolve(root, 'src/data/stores');
const imagesRoot = path.resolve(root, 'public/images');
const storeImagesRoot = path.resolve(imagesRoot, 'stores');

const STORE_META = [
  {
    slug: 'deportes',
    legacyGroup: 'deporte-ciclismo',
    title: 'Tiendita de Deportes',
    description: 'Ropa, componentes, termos y accesorios para ciclismo y deporte.'
  },
  {
    slug: 'tecnologia-electronica',
    legacyGroup: 'tecnologia-electronica',
    title: 'Tiendita de Tecnologia y Electronica',
    description: 'Gadgets, audio, teclados y accesorios electronicos.'
  },
  {
    slug: 'regalos',
    legacyGroup: 'regalos',
    title: 'Tiendita de Regalos',
    description: 'Detalles y productos para regalar.'
  },
  {
    slug: 'embarazadas',
    legacyGroup: 'embarazadas',
    title: 'Tiendita para Embarazadas',
    description: 'Productos pensados para embarazo y maternidad.'
  }
];

const legacyToStore = new Map(STORE_META.map((store) => [store.legacyGroup, store.slug]));

function extractFilename(url) {
  return url.split('/').pop() ?? '';
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function moveImageIfNeeded(fileName, storeSlug) {
  if (!fileName) return;

  const source = path.resolve(imagesRoot, fileName);
  const targetDir = path.resolve(storeImagesRoot, storeSlug);
  const target = path.resolve(targetDir, fileName);

  await mkdir(targetDir, { recursive: true });

  if (await exists(target)) {
    return;
  }

  if (!(await exists(source))) {
    return;
  }

  await rename(source, target);
}

async function main() {
  const legacyRaw = await readFile(legacyProductsPath, 'utf-8');
  const legacyProducts = JSON.parse(legacyRaw);

  if (!Array.isArray(legacyProducts)) {
    throw new Error('Legacy products file must contain an array.');
  }

  const grouped = new Map(STORE_META.map((store) => [store.slug, []]));

  for (const legacyProduct of legacyProducts) {
    const storeSlug = legacyToStore.get(legacyProduct.group) ?? 'deportes';
    const migrated = {
      ...legacyProduct
    };

    delete migrated.group;

    const urls = [];
    if (typeof migrated.imageUrl === 'string') urls.push(migrated.imageUrl);
    if (Array.isArray(migrated.images)) urls.push(...migrated.images);

    for (const imageUrl of urls) {
      const fileName = extractFilename(imageUrl);
      await moveImageIfNeeded(fileName, storeSlug);
    }

    const toStoreUrl = (value) => {
      if (typeof value !== 'string') return value;
      const fileName = extractFilename(value);
      return `https://raw.githubusercontent.com/andyromerodev/TotalSport/main/public/images/stores/${storeSlug}/${fileName}`;
    };

    if (typeof migrated.imageUrl === 'string') {
      migrated.imageUrl = toStoreUrl(migrated.imageUrl);
    }

    if (Array.isArray(migrated.images)) {
      migrated.images = migrated.images.map((value) => toStoreUrl(value));
    }

    grouped.get(storeSlug).push(migrated);
  }

  await mkdir(storesDir, { recursive: true });

  const index = STORE_META.map(({ slug, title, description }) => ({ slug, title, description }));
  await writeFile(path.resolve(storesDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf-8');

  for (const store of STORE_META) {
    const dir = path.resolve(storesDir, store.slug);
    await mkdir(dir, { recursive: true });

    const products = grouped.get(store.slug) ?? [];
    products.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    await writeFile(path.resolve(dir, 'products.json'), `${JSON.stringify(products, null, 2)}\n`, 'utf-8');
  }

  if (!(await exists(legacyBackupPath))) {
    await writeFile(legacyBackupPath, legacyRaw, 'utf-8');
  }

  await writeFile(
    legacyProductsPath,
    JSON.stringify(
      {
        deprecated: true,
        message: 'Migrado a src/data/stores/<slug>/products.json. Use scripts/migrate-to-stores.mjs solo una vez.',
        migratedAt: new Date().toISOString()
      },
      null,
      2
    ) + '\n',
    'utf-8'
  );

  console.log('Migration complete. Stores created:', STORE_META.map((store) => store.slug).join(', '));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
