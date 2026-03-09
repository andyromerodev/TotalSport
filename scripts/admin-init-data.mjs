import { bootstrapFinanceFromCatalog, ensureAdminDataFiles, loadAdminData, loadCatalogProducts, resolveAdminDataPaths, saveAdminData } from './admin-data-core.mjs';

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
