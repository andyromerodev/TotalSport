import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const ROOT_DIR = process.cwd();

export const MOVEMENT_TYPES = ['ENTRY', 'EXIT', 'ADJUSTMENT', 'SALE'];

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function getEnvPath() {
  const value = process.env.ADMIN_DATA_PATH?.trim();
  if (!value) return '../totalsport-admin-data';
  return value;
}

export function resolveAdminDataPaths() {
  const adminDataDir = path.resolve(ROOT_DIR, getEnvPath());
  return {
    adminDataDir,
    financePath: path.resolve(adminDataDir, 'products-finance.json'),
    ledgerPath: path.resolve(adminDataDir, 'inventory-ledger.json')
  };
}

export async function ensureAdminDataFiles() {
  const { adminDataDir, financePath, ledgerPath } = resolveAdminDataPaths();
  await mkdir(adminDataDir, { recursive: true });

  try {
    await readFile(financePath, 'utf-8');
  } catch {
    await writeJson(financePath, []);
  }

  try {
    await readFile(ledgerPath, 'utf-8');
  } catch {
    await writeJson(ledgerPath, []);
  }
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

export function validateFinanceRecord(record, index) {
  assert(isObject(record), `Finance record #${index} must be an object.`);
  assert(typeof record.productId === 'string' && record.productId.trim().length > 0, `Finance record #${index} has invalid productId.`);

  const numericFields = ['costUsd', 'salePriceUsd', 'currentStock', 'unitsSold', 'revenueUsd', 'profitUsd'];
  for (const field of numericFields) {
    assert(typeof record[field] === 'number' && Number.isFinite(record[field]), `Finance record #${index} has invalid ${field}.`);
  }

  assert(record.costUsd >= 0, `Finance record #${index} has negative costUsd.`);
  assert(record.salePriceUsd >= 0, `Finance record #${index} has negative salePriceUsd.`);
  assert(Number.isInteger(record.currentStock) && record.currentStock >= 0, `Finance record #${index} has invalid currentStock.`);
  assert(Number.isInteger(record.unitsSold) && record.unitsSold >= 0, `Finance record #${index} has invalid unitsSold.`);
  assert(record.revenueUsd >= 0, `Finance record #${index} has negative revenueUsd.`);
}

export function validateLedgerRecord(record, index) {
  assert(isObject(record), `Ledger movement #${index} must be an object.`);
  assert(typeof record.id === 'string' && record.id.trim().length > 0, `Ledger movement #${index} has invalid id.`);
  assert(typeof record.productId === 'string' && record.productId.trim().length > 0, `Ledger movement #${index} has invalid productId.`);
  assert(MOVEMENT_TYPES.includes(record.type), `Ledger movement #${index} has invalid type.`);
  assert(typeof record.qty === 'number' && Number.isInteger(record.qty) && record.qty > 0, `Ledger movement #${index} has invalid qty.`);
  assert(typeof record.timestamp === 'string' && record.timestamp.trim().length > 0, `Ledger movement #${index} has invalid timestamp.`);

  if ('unitCostUsd' in record && (typeof record.unitCostUsd !== 'number' || record.unitCostUsd < 0)) {
    throw new Error(`Ledger movement #${index} has invalid unitCostUsd.`);
  }

  if ('unitSaleUsd' in record && (typeof record.unitSaleUsd !== 'number' || record.unitSaleUsd < 0)) {
    throw new Error(`Ledger movement #${index} has invalid unitSaleUsd.`);
  }
}

export async function loadAdminData() {
  await ensureAdminDataFiles();
  const { financePath, ledgerPath } = resolveAdminDataPaths();
  const finance = await readJson(financePath);
  const ledger = await readJson(ledgerPath);

  assert(Array.isArray(finance), 'products-finance.json must be an array.');
  assert(Array.isArray(ledger), 'inventory-ledger.json must be an array.');

  finance.forEach((record, index) => validateFinanceRecord(record, index));
  ledger.forEach((record, index) => validateLedgerRecord(record, index));

  return { finance, ledger };
}

export async function saveAdminData(finance, ledger) {
  const { financePath, ledgerPath } = resolveAdminDataPaths();
  await writeJson(financePath, finance);
  await writeJson(ledgerPath, ledger);
}

function createFinanceRecord(catalogProduct) {
  return {
    productId: catalogProduct.productId,
    costUsd: 0,
    salePriceUsd: catalogProduct.priceUsd,
    currentStock: 0,
    unitsSold: 0,
    revenueUsd: 0,
    profitUsd: 0,
    updatedAt: new Date().toISOString()
  };
}

function normalizeMoney(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  assert(Number.isFinite(parsed) && parsed >= 0, `${fieldName} must be a number greater or equal to 0.`);
  return roundMoney(parsed);
}

export function normalizeMovementInput(input, catalogById) {
  assert(isObject(input), 'Movement payload must be an object.');

  const productId = typeof input.productId === 'string' ? input.productId.trim() : '';
  assert(productId.length > 0, 'productId is required.');
  assert(catalogById.has(productId), `Unknown productId: ${productId}.`);

  const type = typeof input.type === 'string' ? input.type.toUpperCase().trim() : '';
  assert(MOVEMENT_TYPES.includes(type), `type must be one of: ${MOVEMENT_TYPES.join(', ')}.`);

  const qty = Number(input.qty);
  assert(Number.isInteger(qty) && qty > 0, 'qty must be an integer greater than 0.');

  const movement = {
    id: randomUUID(),
    productId,
    type,
    qty,
    note: typeof input.note === 'string' ? input.note.trim() : '',
    timestamp: typeof input.timestamp === 'string' && input.timestamp.trim().length > 0 ? input.timestamp : new Date().toISOString()
  };

  const unitCostUsd = normalizeMoney(input.unitCostUsd, 'unitCostUsd');
  const unitSaleUsd = normalizeMoney(input.unitSaleUsd, 'unitSaleUsd');

  if (unitCostUsd !== undefined) movement.unitCostUsd = unitCostUsd;
  if (unitSaleUsd !== undefined) movement.unitSaleUsd = unitSaleUsd;

  if (type === 'ADJUSTMENT') {
    const adjustmentSign = typeof input.adjustmentSign === 'string' ? input.adjustmentSign.toUpperCase().trim() : '';
    assert(adjustmentSign === 'IN' || adjustmentSign === 'OUT', 'ADJUSTMENT requires adjustmentSign IN or OUT.');
    movement.adjustmentSign = adjustmentSign;
  }

  return movement;
}

export function applyMovement({ movement, finance, catalogById }) {
  const catalogProduct = catalogById.get(movement.productId);
  assert(catalogProduct, `Product not found: ${movement.productId}.`);

  const financeById = new Map(finance.map((record) => [record.productId, { ...record }]));
  const current = financeById.get(movement.productId) ?? createFinanceRecord(catalogProduct);

  const resolvedUnitCost = movement.unitCostUsd ?? current.costUsd;
  const resolvedUnitSale = movement.unitSaleUsd ?? current.salePriceUsd ?? catalogProduct.priceUsd;

  if (movement.type === 'ENTRY') {
    current.currentStock += movement.qty;
    if (movement.unitCostUsd !== undefined) {
      current.costUsd = movement.unitCostUsd;
    }
  }

  if (movement.type === 'EXIT') {
    assert(current.currentStock - movement.qty >= 0, 'Cannot apply EXIT: stock would become negative.');
    current.currentStock -= movement.qty;
  }

  if (movement.type === 'ADJUSTMENT') {
    if (movement.adjustmentSign === 'IN') {
      current.currentStock += movement.qty;
    } else {
      assert(current.currentStock - movement.qty >= 0, 'Cannot apply ADJUSTMENT OUT: stock would become negative.');
      current.currentStock -= movement.qty;
    }
  }

  if (movement.type === 'SALE') {
    assert(current.currentStock - movement.qty >= 0, 'Cannot apply SALE: stock would become negative.');

    current.currentStock -= movement.qty;
    current.unitsSold += movement.qty;
    current.salePriceUsd = resolvedUnitSale;

    if (movement.unitCostUsd !== undefined) {
      current.costUsd = movement.unitCostUsd;
    }

    const revenue = roundMoney(movement.qty * resolvedUnitSale);
    const profit = roundMoney(movement.qty * (resolvedUnitSale - resolvedUnitCost));

    current.revenueUsd = roundMoney(current.revenueUsd + revenue);
    current.profitUsd = roundMoney(current.profitUsd + profit);

    movement.revenueUsd = revenue;
    movement.profitUsd = profit;
  }

  current.updatedAt = new Date().toISOString();
  financeById.set(current.productId, current);

  return Array.from(financeById.values()).sort((a, b) => a.productId.localeCompare(b.productId));
}

export function bootstrapFinanceFromCatalog(catalogProducts, existingFinance) {
  const financeById = new Map(existingFinance.map((record) => [record.productId, record]));

  for (const product of catalogProducts) {
    if (!financeById.has(product.productId)) {
      financeById.set(product.productId, createFinanceRecord(product));
    }
  }

  return Array.from(financeById.values()).sort((a, b) => a.productId.localeCompare(b.productId));
}

export function buildPublicStock(finance, catalogProducts, updatedAt = new Date().toISOString()) {
  const financeById = new Map(finance.map((record) => [record.productId, record]));

  return catalogProducts
    .filter((product) => product.active)
    .map((product) => {
      const record = financeById.get(product.productId);
      if (!record) {
        return {
          productId: product.productId,
          inStock: true,
          updatedAt
        };
      }

      return {
        productId: product.productId,
        inStock: record.currentStock > 0,
        availableQty: record.currentStock,
        updatedAt
      };
    })
    .sort((a, b) => a.productId.localeCompare(b.productId));
}

export function computeDashboard(finance, ledger, fromIso, toIso) {
  let revenueInRange = 0;
  let profitInRange = 0;
  let salesUnitsInRange = 0;

  const from = fromIso ? new Date(fromIso) : null;
  const to = toIso ? new Date(toIso) : null;

  for (const movement of ledger) {
    if (movement.type !== 'SALE') continue;

    const ts = new Date(movement.timestamp);
    if (Number.isNaN(ts.getTime())) continue;
    if (from && ts < from) continue;
    if (to && ts > to) continue;

    revenueInRange += Number(movement.revenueUsd ?? 0);
    profitInRange += Number(movement.profitUsd ?? 0);
    salesUnitsInRange += Number(movement.qty ?? 0);
  }

  const outOfStock = finance.filter((record) => record.currentStock <= 0).length;
  const totalStock = finance.reduce((acc, record) => acc + record.currentStock, 0);

  return {
    totalProducts: finance.length,
    outOfStock,
    totalStock,
    salesUnitsInRange,
    revenueInRange: roundMoney(revenueInRange),
    profitInRange: roundMoney(profitInRange)
  };
}
