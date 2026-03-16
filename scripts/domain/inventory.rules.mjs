import { assert, isObject } from '../lib/assert.mjs';
import { roundMoney } from '../lib/money.mjs';

export const MOVEMENT_TYPES = ['ENTRY', 'EXIT', 'ADJUSTMENT', 'SALE'];

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

export function bootstrapFinanceFromCatalog(catalogProducts, existingFinance) {
  const financeById = new Map(existingFinance.map((record) => [record.productId, record]));

  for (const product of catalogProducts) {
    if (!financeById.has(product.productId)) {
      financeById.set(product.productId, createFinanceRecord(product));
    }
  }

  return Array.from(financeById.values()).sort((a, b) => a.productId.localeCompare(b.productId));
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
