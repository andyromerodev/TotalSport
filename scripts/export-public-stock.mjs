import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildPublicStock, bootstrapFinanceFromCatalog, loadAdminData, loadCatalogProducts } from './admin-data-core.mjs';

const publicStockPath = path.resolve(process.cwd(), 'src/data/public-stock.json');

async function main() {
  const catalog = await loadCatalogProducts();
  const { finance, ledger } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);

  // Public projection intentionally excludes cost/profit/revenue details.
  const publicStock = buildPublicStock(mergedFinance, catalog);
  await writeFile(publicStockPath, `${JSON.stringify(publicStock, null, 2)}\n`, 'utf-8');

  console.log(`Exported ${publicStock.length} public stock records to ${publicStockPath}`);
  console.log(`Using ${ledger.length} ledger entries from private admin data.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
