import { loadCatalogProducts } from '../infrastructure/jsonCatalogReader.mjs';
import { loadAdminData } from '../infrastructure/jsonAdminRepository.mjs';
import { bootstrapFinanceFromCatalog, computeDashboard } from '../domain/inventory.rules.mjs';

export async function getDashboard(fromIso, toIso) {
  const catalog = await loadCatalogProducts();
  const { finance, ledger } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);
  return computeDashboard(mergedFinance, ledger, fromIso, toIso);
}
