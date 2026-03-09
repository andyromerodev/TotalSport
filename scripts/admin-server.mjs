import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';
import {
  applyMovement,
  bootstrapFinanceFromCatalog,
  buildPublicStock,
  computeDashboard,
  ensureAdminDataFiles,
  loadAdminData,
  loadCatalogProducts,
  normalizeMovementInput,
  resolveAdminDataPaths,
  saveAdminData
} from './admin-data-core.mjs';

const rootDir = process.cwd();
const uiDir = path.resolve(rootDir, 'scripts/admin-panel');
const publicStockPath = path.resolve(rootDir, 'src/data/public-stock.json');

const port = Number(process.env.ADMIN_PORT ?? 4310);
const host = '127.0.0.1';

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(payload);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function withCatalogMeta(finance, catalog) {
  const catalogById = new Map(catalog.map((item) => [item.productId, item]));

  return finance.map((record) => {
    const meta = catalogById.get(record.productId);
    return {
      ...record,
      name: meta?.name ?? record.productId,
      category: meta?.category ?? 'Sin categoria',
      storeSlug: meta?.storeSlug ?? 'n/a',
      storeTitle: meta?.storeTitle ?? 'n/a',
      inStock: record.currentStock > 0
    };
  });
}

function filterFinanceRecords(records, query) {
  const q = (query.search ?? '').toString().trim().toLowerCase();
  const store = (query.store ?? '').toString().trim().toLowerCase();
  const category = (query.category ?? '').toString().trim().toLowerCase();
  const status = (query.status ?? '').toString().trim().toLowerCase();

  return records.filter((record) => {
    if (q.length > 0) {
      const matches =
        record.productId.toLowerCase().includes(q) ||
        record.name.toLowerCase().includes(q) ||
        record.category.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (store.length > 0 && record.storeSlug.toLowerCase() !== store) {
      return false;
    }

    if (category.length > 0 && record.category.toLowerCase() !== category) {
      return false;
    }

    if (status === 'in-stock' && record.currentStock <= 0) {
      return false;
    }

    if (status === 'out-of-stock' && record.currentStock > 0) {
      return false;
    }

    return true;
  });
}

async function handleApi(req, res, url) {
  const catalog = await loadCatalogProducts();
  const catalogById = new Map(catalog.map((item) => [item.productId, item]));
  const { finance, ledger } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    const { adminDataDir } = resolveAdminDataPaths();
    return sendJson(res, 200, { ok: true, adminDataDir });
  }

  if (req.method === 'GET' && url.pathname === '/api/products') {
    const records = withCatalogMeta(mergedFinance, catalog);
    const filtered = filterFinanceRecords(records, Object.fromEntries(url.searchParams.entries()));
    const stores = [...new Set(records.map((item) => item.storeSlug))].sort();
    const categories = [...new Set(records.map((item) => item.category))].sort();

    return sendJson(res, 200, {
      items: filtered,
      stores,
      categories
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/ledger') {
    const from = url.searchParams.get('from') ?? undefined;
    const to = url.searchParams.get('to') ?? undefined;
    const productId = url.searchParams.get('productId') ?? '';

    const filtered = ledger
      .filter((movement) => {
        if (productId && movement.productId !== productId) return false;

        const ts = new Date(movement.timestamp);
        if (Number.isNaN(ts.getTime())) return false;

        if (from && ts < new Date(from)) return false;
        if (to && ts > new Date(to)) return false;

        return true;
      })
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    return sendJson(res, 200, { items: filtered });
  }

  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    const from = url.searchParams.get('from') ?? undefined;
    const to = url.searchParams.get('to') ?? undefined;
    const dashboard = computeDashboard(mergedFinance, ledger, from, to);
    return sendJson(res, 200, dashboard);
  }

  if (req.method === 'POST' && url.pathname === '/api/movements') {
    const payload = await readBody(req);
    const movement = normalizeMovementInput(payload, catalogById);
    const nextFinance = applyMovement({ movement, finance: mergedFinance, catalogById });
    const nextLedger = [...ledger, movement];

    await saveAdminData(nextFinance, nextLedger);
    return sendJson(res, 201, {
      movement,
      product: withCatalogMeta(nextFinance, catalog).find((item) => item.productId === movement.productId)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/export-public-stock') {
    const publicStock = buildPublicStock(mergedFinance, catalog);
    await writeFile(publicStockPath, `${JSON.stringify(publicStock, null, 2)}\n`, 'utf-8');

    return sendJson(res, 200, {
      exported: publicStock.length,
      target: publicStockPath
    });
  }

  return sendJson(res, 404, { error: 'Not found' });
}

async function serveUi(res, pathname) {
  const filePath = path.resolve(uiDir, pathname === '/' ? 'index.html' : `.${pathname}`);

  if (!filePath.startsWith(uiDir)) {
    return sendText(res, 403, 'Forbidden');
  }

  let mime = 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) mime = 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) mime = 'text/css; charset=utf-8';

  try {
    const contents = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(contents);
  } catch {
    sendText(res, 404, 'Not found');
  }
}

async function main() {
  await ensureAdminDataFiles();

  const server = createServer(async (req, res) => {
    try {
      if (!req.url) return sendText(res, 400, 'Invalid request');

      const url = new URL(req.url, `http://${host}:${port}`);

      if (url.pathname.startsWith('/api/')) {
        await handleApi(req, res, url);
        return;
      }

      if (req.method !== 'GET') {
        return sendText(res, 405, 'Method not allowed');
      }

      await serveUi(res, url.pathname);
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
  });

  server.listen(port, host, () => {
    const { adminDataDir } = resolveAdminDataPaths();
    console.log(`Admin panel running at http://${host}:${port}`);
    console.log(`Using private admin data at ${adminDataDir}`);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
