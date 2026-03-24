import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';
import { ensureAdminDataFiles, resolveAdminDataPaths } from './infrastructure/jsonAdminRepository.mjs';
import { getProductsUseCase } from './application/GetProductsUseCase.mjs';
import { getDashboardUseCase } from './application/GetDashboardUseCase.mjs';
import { getLedgerUseCase } from './application/GetLedgerUseCase.mjs';
import { registerMovementUseCase } from './application/RegisterMovementUseCase.mjs';
import { exportPublicStockUseCase } from './application/ExportPublicStockUseCase.mjs';
import { updateFinanceRowUseCase } from './application/UpdateFinanceRowUseCase.mjs';

const rootDir = process.cwd();
const uiDir = path.resolve(rootDir, 'scripts/admin-panel');

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

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    const { adminDataDir } = resolveAdminDataPaths();
    return sendJson(res, 200, { ok: true, adminDataDir });
  }

  if (req.method === 'GET' && url.pathname === '/api/products') {
    const result = await getProductsUseCase(Object.fromEntries(url.searchParams.entries()));
    return sendJson(res, 200, result);
  }

  if (req.method === 'GET' && url.pathname === '/api/ledger') {
    const result = await getLedgerUseCase({
      productId: url.searchParams.get('productId') ?? '',
      from: url.searchParams.get('from') ?? undefined,
      to: url.searchParams.get('to') ?? undefined
    });
    return sendJson(res, 200, result);
  }

  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    const result = await getDashboardUseCase(
      url.searchParams.get('from') ?? undefined,
      url.searchParams.get('to') ?? undefined
    );
    return sendJson(res, 200, result);
  }

  if (req.method === 'POST' && url.pathname === '/api/movements') {
    const payload = await readBody(req);
    const result = await registerMovementUseCase(payload);
    return sendJson(res, 201, result);
  }

  if (req.method === 'PATCH' && url.pathname.startsWith('/api/products/') && url.pathname.endsWith('/finance')) {
    const productPath = url.pathname.slice('/api/products/'.length, -'/finance'.length);
    const productId = decodeURIComponent(productPath);
    const payload = await readBody(req);
    const result = await updateFinanceRowUseCase(productId, payload);
    return sendJson(res, 200, result);
  }

  if (req.method === 'POST' && url.pathname === '/api/export-public-stock') {
    const result = await exportPublicStockUseCase();
    return sendJson(res, 200, result);
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
