import { exportPublicStockUseCase } from './application/ExportPublicStockUseCase.mjs';

async function main() {
  const { exported, target } = await exportPublicStockUseCase();
  console.log(`Exported ${exported} public stock records to ${target}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
