import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';
import { ensureAdminDataFiles, resolveAdminDataPaths, loadInventario, saveInventario } from './infrastructure/jsonAdminRepository.mjs';
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

  if (req.method === 'GET' && url.pathname === '/api/inventario') {
    const data = await loadInventario();
    return sendJson(res, 200, data);
  }

  if (req.method === 'PUT' && url.pathname === '/api/inventario') {
    const payload = await readBody(req);
    await saveInventario(payload);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/api/export-hermana') {
    const inventario = await loadInventario();
    const rows = inventario.rows.map(r => {
      const envUd = r.cantidad > 0 ? (r.pesoLb * r.costoEnvioLb) / r.cantidad : 0;
      const cc = r.precioCompra + envUd;
      const g = r.precioVenta - cc;
      const hu = g > 0 ? g * (r.porcentajeHermana / 100) : 0;
      return { p: r.producto, q: r.cantidad, v: r.precioVenta, hu: Math.round(hu * 100) / 100, ht: Math.round(hu * r.cantidad * 100) / 100 };
    }).filter(r => r.v > 0);

    const totalAportacion = rows.reduce((s, r) => s + r.ht, 0);
    const totalQty = rows.reduce((s, r) => s + r.q, 0);
    const totalVenta = rows.reduce((s, r) => s + r.v * r.q, 0);
    const now = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>ALKILO — Aportacion Hermana</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f6f8;color:#1a1e24;padding:1rem .75rem 3rem;-webkit-font-smoothing:antialiased}
.container{max-width:600px;margin:0 auto}
header{text-align:center;margin-bottom:1.25rem}
header h1{font-size:1.3rem;font-weight:800;letter-spacing:-.02em;color:#0a7f52}
header .sub{font-size:.82rem;color:#64748b;margin-top:.25rem}
header .total-box{background:#0a7f52;color:#fff;border-radius:16px;padding:1rem;margin-top:.75rem;display:flex;justify-content:space-between;align-items:center}
header .total-box .label{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;opacity:.85}
header .total-box .value{font-size:1.6rem;font-weight:800}
.card{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.06);overflow-x:auto;-webkit-overflow-scrolling:touch}
.card-inner{min-width:440px}
.card-row{display:grid;grid-template-columns:1fr 36px 60px 70px 70px;gap:.25rem;padding:.6rem .65rem;align-items:center;border-bottom:1px solid #f0f2f4}
.card-row:last-child{border-bottom:none}
.card-row .name{font-size:.82rem;font-weight:600;line-height:1.3;word-break:break-word;min-width:140px}
.card-row .qty{text-align:center;font-size:.82rem;color:#64748b;font-weight:600}
.card-row .price{text-align:right;font-size:.82rem;color:#64748b}
.card-row .profit{text-align:right;font-size:.88rem;font-weight:700;color:#0a7f52}
.card-header{display:grid;grid-template-columns:1fr 36px 60px 70px 70px;gap:.25rem;padding:.5rem .65rem;background:#f8fafc;font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:#64748b;font-weight:700}
.card-header .right{text-align:right}
.card-total{display:grid;grid-template-columns:1fr 36px 60px 70px 70px;gap:.25rem;padding:.6rem .65rem;background:#e8f5ee;font-weight:700;font-size:.88rem}
.card-total .profit{color:#0a7f52;font-weight:800}
.card-total .right{text-align:right}
footer{text-align:center;margin-top:1.5rem;font-size:.7rem;color:#94a3b8}
@media(prefers-color-scheme:dark){body{background:#0f1115;color:#e2e8f0}.card{background:#1a1e24}.card-row{border-bottom-color:#2a2e34}.card-header{background:#252930;color:#94a3b8}.card-row .qty,.card-row .price{color:#94a3b8}.card-total{background:#0a2e1e}header h1{color:#34d399}}
</style>
</head>
<body>
<div class="container">
<header>
<h1>💰 Aportacion Hermana</h1>
<p class="sub">${rows.length} productos &middot; ${totalQty} unidades &middot; ALKILO</p>
<div class="total-box">
<div><div class="label">Tu aportacion total</div><div class="value">$${totalAportacion.toFixed(2)}</div></div>
<div><div style="text-align:right"><div class="label">Venta total</div><div style="font-size:1rem;font-weight:700">$${totalVenta.toFixed(2)}</div></div></div>
</div>
</header>
<div class="card">
<div class="card-inner">
<div class="card-header"><span>Producto</span><span class="right">Qty</span><span class="right">Venta</span><span class="right">Tu parte ud.</span><span class="right">Tu parte total</span></div>
${rows.map(r => '<div class="card-row"><span class="name">' + esc(r.p) + '</span><span class="qty">' + r.q + '</span><span class="price">$' + r.v.toFixed(2) + '</span><span class="profit">$' + r.hu.toFixed(2) + '</span><span class="profit">$' + r.ht.toFixed(2) + '</span></div>').join('')}
<div class="card-total"><span>TOTAL</span><span class="qty">${totalQty}</span><span class="price">$${totalVenta.toFixed(2)}</span><span class="profit">—</span><span class="profit">$${totalAportacion.toFixed(2)}</span></div>
</div></div>
<footer>ALKILO &middot; TotalSport &middot; ${now}</footer>
</div>
</body>
</html>`;

    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': 'attachment; filename="para-mi-hermana.html"' });
    res.end(html);
    return;
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
