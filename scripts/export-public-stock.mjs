import { exportPublicStock } from './application/exportPublicStock.mjs';

async function main() {
  const { exported, target } = await exportPublicStock();
  console.log(`Exported ${exported} public stock records to ${target}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
