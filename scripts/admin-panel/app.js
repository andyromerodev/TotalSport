const metricsEl = document.getElementById('metrics');
const productsTable = document.getElementById('products-table');
const ledgerList = document.getElementById('ledger-list');
const statusEl = document.getElementById('status');

const movementForm = document.getElementById('movement-form');
const productSelect = document.getElementById('productId');
const typeSelect = document.getElementById('type');
const qtyInput = document.getElementById('qty');
const adjustmentWrap = document.getElementById('adjustment-wrap');
const adjustmentSign = document.getElementById('adjustmentSign');
const unitCostInput = document.getElementById('unitCostUsd');
const unitSaleInput = document.getElementById('unitSaleUsd');
const noteInput = document.getElementById('note');

const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const searchInput = document.getElementById('search');

const refreshButton = document.getElementById('refresh');
const exportButton = document.getElementById('export-stock');

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

let products = [];
let ledger = [];

function setStatus(message, error = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', Boolean(error));
}

function prettyDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function renderMetrics(dashboard) {
  const rows = [
    ['Productos', dashboard.totalProducts],
    ['Stock total', dashboard.totalStock],
    ['Agotados', dashboard.outOfStock],
    ['Ventas rango', dashboard.salesUnitsInRange],
    ['Ingresos rango', currency.format(dashboard.revenueInRange)],
    ['Ganancia rango', currency.format(dashboard.profitInRange)]
  ];

  metricsEl.innerHTML = rows
    .map(
      ([label, value]) => `
      <article class="metric">
        <p class="label">${label}</p>
        <p class="value">${value}</p>
      </article>
    `
    )
    .join('');
}

function renderProductOptions() {
  productSelect.innerHTML = products
    .map((item) => `<option value="${item.productId}">${item.name} (${item.currentStock})</option>`)
    .join('');
}

function renderProductsTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = products.filter((item) => {
    if (!query) return true;
    return (
      item.productId.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  productsTable.innerHTML = filtered
    .map((item) => {
      const lowClass = item.currentStock <= 0 ? 'stock-low' : '';
      return `
      <tr>
        <td>${item.name}<br /><span class="muted">${item.productId}</span></td>
        <td>${item.storeTitle}<br /><span class="muted">${item.category}</span></td>
        <td class="${lowClass}">${item.currentStock}</td>
        <td>${currency.format(item.costUsd)}</td>
        <td>${currency.format(item.salePriceUsd)}</td>
        <td>${currency.format(item.profitUsd)}</td>
      </tr>
    `;
    })
    .join('');
}

function renderLedger() {
  if (!ledger.length) {
    ledgerList.innerHTML = '<li>Sin movimientos en el rango seleccionado.</li>';
    return;
  }

  ledgerList.innerHTML = ledger
    .slice(0, 80)
    .map((entry) => {
      const parts = [`${entry.type} x${entry.qty}`, entry.productId, prettyDate(entry.timestamp)];
      if (typeof entry.revenueUsd === 'number') parts.push(`Ingresos ${currency.format(entry.revenueUsd)}`);
      if (typeof entry.profitUsd === 'number') parts.push(`Ganancia ${currency.format(entry.profitUsd)}`);
      if (entry.note) parts.push(entry.note);
      return `<li>${parts.join(' • ')}</li>`;
    })
    .join('');
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? 'Request failed');
  }
  return json;
}

async function loadProducts() {
  const data = await fetchJson('/api/products');
  products = data.items;
  renderProductOptions();
  renderProductsTable();
}

async function loadDashboard() {
  const query = new URLSearchParams();
  if (fromInput.value) query.set('from', fromInput.value);
  if (toInput.value) query.set('to', toInput.value);

  const dashboard = await fetchJson(`/api/dashboard?${query.toString()}`);
  renderMetrics(dashboard);
}

async function loadLedger() {
  const query = new URLSearchParams();
  if (fromInput.value) query.set('from', fromInput.value);
  if (toInput.value) query.set('to', toInput.value);

  const data = await fetchJson(`/api/ledger?${query.toString()}`);
  ledger = data.items;
  renderLedger();
}

async function refreshAll() {
  await Promise.all([loadProducts(), loadDashboard(), loadLedger()]);
}

typeSelect.addEventListener('change', () => {
  adjustmentWrap.classList.toggle('hidden', typeSelect.value !== 'ADJUSTMENT');
});

searchInput.addEventListener('input', renderProductsTable);

movementForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    productId: productSelect.value,
    type: typeSelect.value,
    qty: Number(qtyInput.value),
    note: noteInput.value.trim()
  };

  if (adjustmentSign.value && typeSelect.value === 'ADJUSTMENT') {
    payload.adjustmentSign = adjustmentSign.value;
  }

  if (unitCostInput.value) payload.unitCostUsd = Number(unitCostInput.value);
  if (unitSaleInput.value) payload.unitSaleUsd = Number(unitSaleInput.value);

  try {
    setStatus('Guardando movimiento...');
    await fetchJson('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    qtyInput.value = '';
    unitCostInput.value = '';
    unitSaleInput.value = '';
    noteInput.value = '';

    await refreshAll();
    setStatus('Movimiento guardado.');
  } catch (error) {
    setStatus(error.message, true);
  }
});

refreshButton.addEventListener('click', async () => {
  try {
    await Promise.all([loadDashboard(), loadLedger()]);
    setStatus('Rango actualizado.');
  } catch (error) {
    setStatus(error.message, true);
  }
});

exportButton.addEventListener('click', async () => {
  try {
    const data = await fetchJson('/api/export-public-stock', { method: 'POST' });
    setStatus(`Stock público exportado (${data.exported} registros).`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

(async function init() {
  try {
    setStatus('Cargando panel...');
    await refreshAll();
    setStatus('Panel listo.');
  } catch (error) {
    setStatus(error.message, true);
  }
})();
