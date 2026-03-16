import { loadAdminData } from './infrastructure/jsonAdminRepository.mjs';
import { loadCatalogProducts } from './infrastructure/jsonCatalogReader.mjs';

async function main() {
  const catalog = await loadCatalogProducts();
  const catalogIds = new Set(catalog.map((item) => item.productId));
  const { finance, ledger } = await loadAdminData();

  const financeIds = new Set();

  for (const [index, record] of finance.entries()) {
    if (financeIds.has(record.productId)) {
      throw new Error(`Duplicate finance record for productId ${record.productId} at index ${index}.`);
    }
    financeIds.add(record.productId);

    if (!catalogIds.has(record.productId)) {
      throw new Error(`Finance record references unknown productId: ${record.productId}.`);
    }
  }

  for (const [index, movement] of ledger.entries()) {
    if (!catalogIds.has(movement.productId)) {
      throw new Error(`Ledger movement #${index} references unknown productId: ${movement.productId}.`);
    }
  }

  console.log(`OK: ${finance.length} finance records and ${ledger.length} ledger movements validated.`);
}

main().catch((error) => {
  console.error(`Validation error: ${error.message}`);
  process.exit(1);
});
