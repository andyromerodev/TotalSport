import {
  ensureAdminDataFiles,
  loadAdminData,
  saveAdminData,
  resolveAdminDataPaths
} from './infrastructure/jsonAdminRepository.mjs';
import { loadCatalogProducts } from './infrastructure/jsonCatalogReader.mjs';
import { bootstrapFinanceFromCatalog } from './domain/inventory.rules.mjs';

async function main() {
  await ensureAdminDataFiles();
  const catalog = await loadCatalogProducts();
  const { finance, ledger } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);

  await saveAdminData(mergedFinance, ledger);

  const { adminDataDir } = resolveAdminDataPaths();
  console.log(`Admin data initialized at ${adminDataDir}`);
  console.log(`Products in finance: ${mergedFinance.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
