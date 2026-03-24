import { assert } from '../lib/assert.mjs';
import { loadCatalogProducts } from '../infrastructure/jsonCatalogReader.mjs';
import { loadAdminData, saveAdminData } from '../infrastructure/jsonAdminRepository.mjs';
import { bootstrapFinanceFromCatalog } from '../domain/inventory.rules.mjs';
import { withCatalogMeta } from './GetProductsUseCase.mjs';

function normalizeNonNegativeNumber(value, fieldName) {
  const parsed = Number(value);
  assert(Number.isFinite(parsed) && parsed >= 0, `${fieldName} must be a number greater or equal to 0.`);
  return parsed;
}

function normalizeStock(value) {
  const parsed = Number(value);
  assert(Number.isInteger(parsed) && parsed >= 0, 'currentStock must be an integer greater or equal to 0.');
  return parsed;
}

export async function updateFinanceRowUseCase(productId, payload) {
  const cleanProductId = typeof productId === 'string' ? productId.trim() : '';
  assert(cleanProductId.length > 0, 'productId is required.');

  const catalog = await loadCatalogProducts();
  const catalogById = new Map(catalog.map((item) => [item.productId, item]));
  assert(catalogById.has(cleanProductId), `Unknown productId: ${cleanProductId}.`);

  const { finance, ledger } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);
  const current = mergedFinance.find((record) => record.productId === cleanProductId);
  assert(current, `Finance record not found for productId: ${cleanProductId}.`);

  const currentStock =
    payload.currentStock === undefined ? current.currentStock : normalizeStock(payload.currentStock);
  const costUsd = payload.costUsd === undefined ? current.costUsd : normalizeNonNegativeNumber(payload.costUsd, 'costUsd');
  const salePriceUsd =
    payload.salePriceUsd === undefined
      ? current.salePriceUsd
      : normalizeNonNegativeNumber(payload.salePriceUsd, 'salePriceUsd');

  const updated = {
    ...current,
    currentStock,
    costUsd,
    salePriceUsd,
    updatedAt: new Date().toISOString()
  };

  const nextFinance = mergedFinance
    .map((record) => (record.productId === cleanProductId ? updated : record))
    .sort((a, b) => a.productId.localeCompare(b.productId));

  await saveAdminData(nextFinance, ledger);

  return {
    product: withCatalogMeta(nextFinance, catalog).find((item) => item.productId === cleanProductId)
  };
}
