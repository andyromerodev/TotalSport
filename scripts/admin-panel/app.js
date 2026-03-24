const metricsEl = document.getElementById('metrics');
const productsTable = document.getElementById('products-table');
const ledgerList = document.getElementById('ledger-list');
const statusEl = document.getElementById('status');
const runtimeMeta = document.getElementById('runtime-meta');
const productsCount = document.getElementById('products-count');

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

const movementLabel = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT: 'Ajuste',
  SALE: 'Venta'
};

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

  productsCount.textContent = `${filtered.length} de ${products.length} visibles`;

  productsTable.innerHTML = filtered
    .map((item) => {
      const lowClass = item.currentStock <= 0 ? 'stock-low' : '';
      return `
      <tr data-product-id="${item.productId}" data-product-name="${item.name}">
        <td>${item.name}<br /><span class="muted">${item.productId}</span></td>
        <td>${item.storeTitle}<br /><span class="muted">${item.category}</span></td>
        <td class="${lowClass}">
          <input class="cell-input stock-input" type="number" min="0" step="1" value="${item.currentStock}" />
        </td>
        <td>
          <input class="cell-input cost-input" type="number" min="0" step="0.01" value="${item.costUsd}" />
        </td>
        <td>
          <input class="cell-input price-input" type="number" min="0" step="0.01" value="${item.salePriceUsd}" />
        </td>
        <td>${currency.format(item.profitUsd)}</td>
        <td>
          <div class="row-actions">
            <button class="finance-save btn-tertiary" type="button">Guardar datos</button>
            <div class="movement-inline">
              <select class="row-movement-type" aria-label="Tipo de movimiento para ${item.name}">
                <option value="ENTRY">Entrada</option>
                <option value="EXIT">Salida</option>
                <option value="ADJUSTMENT">Ajuste</option>
                <option value="SALE">Venta</option>
              </select>
              <input class="row-movement-qty" type="number" min="1" step="1" value="1" aria-label="Cantidad para ${item.name}" />
              <select class="row-adjustment-sign hidden" aria-label="Signo de ajuste para ${item.name}">
                <option value="IN">Sumar</option>
                <option value="OUT">Restar</option>
              </select>
              <button class="row-movement-save btn-secondary" type="button">Registrar</button>
            </div>
          </div>
        </td>
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
      const label = movementLabel[entry.type] ?? entry.type;
      const parts = [`${label} x${entry.qty}`, entry.productId, prettyDate(entry.timestamp)];
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
  renderProductsTable();
}

async function loadRuntimeMeta() {
  const data = await fetchJson('/api/health');
  const now = new Date().toLocaleString();
  runtimeMeta.textContent = `Datos privados: ${data.adminDataDir} • Actualizado: ${now}`;
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
  await Promise.all([loadProducts(), loadDashboard(), loadLedger(), loadRuntimeMeta()]);
}

function getRowPayload(row) {
  const stockInput = row.querySelector('.stock-input');
  const costInput = row.querySelector('.cost-input');
  const priceInput = row.querySelector('.price-input');

  const currentStock = Number(stockInput.value);
  const costUsd = Number(costInput.value);
  const salePriceUsd = Number(priceInput.value);

  if (!Number.isInteger(currentStock) || currentStock < 0) {
    throw new Error('Stock debe ser un entero mayor o igual a 0.');
  }

  if (!Number.isFinite(costUsd) || costUsd < 0) {
    throw new Error('Costo debe ser un numero mayor o igual a 0.');
  }

  if (!Number.isFinite(salePriceUsd) || salePriceUsd < 0) {
    throw new Error('Precio debe ser un numero mayor o igual a 0.');
  }

  return { currentStock, costUsd, salePriceUsd };
}

async function saveRowFinance(row) {
  const productId = row.dataset.productId;
  const productName = row.dataset.productName ?? productId;
  const payload = getRowPayload(row);

  const saveButton = row.querySelector('.finance-save');
  saveButton.disabled = true;

  try {
    setStatus(`Guardando datos de ${productName}...`);
    await fetchJson(`/api/products/${encodeURIComponent(productId)}/finance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    await refreshAll();
    setStatus(`Datos guardados para ${productName}.`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
}

async function registerRowMovement(row) {
  const productId = row.dataset.productId;
  const productName = row.dataset.productName ?? productId;

  const typeSelect = row.querySelector('.row-movement-type');
  const qtyInput = row.querySelector('.row-movement-qty');
  const signSelect = row.querySelector('.row-adjustment-sign');

  const qty = Number(qtyInput.value);
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error('Cantidad debe ser un entero mayor que 0.');
  }

  const payload = {
    productId,
    type: typeSelect.value,
    qty,
    note: 'Movimiento desde tabla'
  };

  if (typeSelect.value === 'ADJUSTMENT') {
    payload.adjustmentSign = signSelect.value;
  }

  const moveButton = row.querySelector('.row-movement-save');
  moveButton.disabled = true;

  try {
    setStatus(`Registrando movimiento de ${productName}...`);
    await fetchJson('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    await refreshAll();
    setStatus(`Movimiento registrado para ${productName}.`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    moveButton.disabled = false;
  }
}

searchInput.addEventListener('input', renderProductsTable);

productsTable.addEventListener('change', (event) => {
  const typeSelect = event.target.closest('.row-movement-type');
  if (!typeSelect) return;

  const row = typeSelect.closest('tr');
  if (!row) return;

  const signSelect = row.querySelector('.row-adjustment-sign');
  signSelect.classList.toggle('hidden', typeSelect.value !== 'ADJUSTMENT');
});

productsTable.addEventListener('click', async (event) => {
  const financeButton = event.target.closest('.finance-save');
  if (financeButton) {
    const row = financeButton.closest('tr');
    if (!row) return;
    await saveRowFinance(row);
    return;
  }

  const movementButton = event.target.closest('.row-movement-save');
  if (movementButton) {
    const row = movementButton.closest('tr');
    if (!row) return;
    try {
      await registerRowMovement(row);
    } catch (error) {
      setStatus(error.message, true);
    }
  }
});

productsTable.addEventListener('keydown', async (event) => {
  if (event.key !== 'Enter') return;

  const isCellInput = event.target.classList.contains('cell-input');
  const isMovementQty = event.target.classList.contains('row-movement-qty');

  if (isCellInput) {
    event.preventDefault();
    const row = event.target.closest('tr');
    if (!row) return;
    await saveRowFinance(row);
    return;
  }

  if (isMovementQty) {
    event.preventDefault();
    const row = event.target.closest('tr');
    if (!row) return;
    try {
      await registerRowMovement(row);
    } catch (error) {
      setStatus(error.message, true);
    }
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
    setStatus(`Stock publico exportado (${data.exported} registros).`);
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
