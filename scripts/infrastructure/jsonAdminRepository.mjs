import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assert } from '../lib/assert.mjs';
import { validateFinanceRecord, validateLedgerRecord } from '../domain/inventory.rules.mjs';

const ROOT_DIR = process.cwd();

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function getEnvPath() {
  const value = process.env.ADMIN_DATA_PATH?.trim();
  if (!value) return '../totalsport-admin-data';
  return value;
}

export function resolveAdminDataPaths() {
  const adminDataDir = path.resolve(ROOT_DIR, getEnvPath());
  return {
    adminDataDir,
    financePath: path.resolve(adminDataDir, 'products-finance.json'),
    ledgerPath: path.resolve(adminDataDir, 'inventory-ledger.json')
  };
}

export async function ensureAdminDataFiles() {
  const { adminDataDir, financePath, ledgerPath } = resolveAdminDataPaths();
  await mkdir(adminDataDir, { recursive: true });

  try {
    await readFile(financePath, 'utf-8');
  } catch {
    await writeJson(financePath, []);
  }

  try {
    await readFile(ledgerPath, 'utf-8');
  } catch {
    await writeJson(ledgerPath, []);
  }
}

export async function loadAdminData() {
  await ensureAdminDataFiles();
  const { financePath, ledgerPath } = resolveAdminDataPaths();
  const finance = await readJson(financePath);
  const ledger = await readJson(ledgerPath);

  assert(Array.isArray(finance), 'products-finance.json must be an array.');
  assert(Array.isArray(ledger), 'inventory-ledger.json must be an array.');

  finance.forEach((record, index) => validateFinanceRecord(record, index));
  ledger.forEach((record, index) => validateLedgerRecord(record, index));

  return { finance, ledger };
}

export async function saveAdminData(finance, ledger) {
  const { financePath, ledgerPath } = resolveAdminDataPaths();
  await writeJson(financePath, finance);
  await writeJson(ledgerPath, ledger);
}
