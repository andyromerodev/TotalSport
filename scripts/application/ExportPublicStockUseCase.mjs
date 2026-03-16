import { loadCatalogProducts } from '../infrastructure/jsonCatalogReader.mjs';
import { loadAdminData } from '../infrastructure/jsonAdminRepository.mjs';
import { bootstrapFinanceFromCatalog } from '../domain/inventory.rules.mjs';
import { buildPublicStock } from '../domain/stock.projection.mjs';
import { writePublicStock } from '../infrastructure/publicStockWriter.mjs';

export async function exportPublicStockUseCase() {
  const catalog = await loadCatalogProducts();
  const { finance } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);
  const publicStock = buildPublicStock(mergedFinance, catalog);
  const target = await writePublicStock(publicStock);

  return { exported: publicStock.length, target };
}
