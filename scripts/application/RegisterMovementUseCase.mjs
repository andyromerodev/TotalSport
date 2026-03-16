import { loadCatalogProducts } from '../infrastructure/jsonCatalogReader.mjs';
import { loadAdminData, saveAdminData } from '../infrastructure/jsonAdminRepository.mjs';
import { bootstrapFinanceFromCatalog, applyMovement } from '../domain/inventory.rules.mjs';
import { normalizeMovementInput } from '../lib/normalize.mjs';
import { withCatalogMeta } from './GetProductsUseCase.mjs';

export async function registerMovementUseCase(payload) {
  const catalog = await loadCatalogProducts();
  const catalogById = new Map(catalog.map((item) => [item.productId, item]));
  const { finance, ledger } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);

  const movement = normalizeMovementInput(payload, catalogById);
  const nextFinance = applyMovement({ movement, finance: mergedFinance, catalogById });
  const nextLedger = [...ledger, movement];

  await saveAdminData(nextFinance, nextLedger);

  return {
    movement,
    product: withCatalogMeta(nextFinance, catalog).find((item) => item.productId === movement.productId)
  };
}
