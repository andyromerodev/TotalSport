import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const publicStockPath = path.resolve(process.cwd(), 'src/data/public-stock.json');

export async function writePublicStock(data) {
  await writeFile(publicStockPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  return publicStockPath;
}
