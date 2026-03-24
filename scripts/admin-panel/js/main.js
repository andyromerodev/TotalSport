import { adminApi } from './api.js';
import { createToast } from './toast.js';
import { renderLedger, renderMetrics, renderProductsTable } from './views.js';

const metricsEl = document.getElementById('metrics');
const productsTable = document.getElementById('products-table');
const ledgerList = document.getElementById('ledger-list');
const runtimeMeta = document.getElementById('runtime-meta');
const productsCount = document.getElementById('products-count');
const toastRoot = document.getElementById('toast-root');

const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const searchInput = document.getElementById('search');
const refreshButton = document.getElementById('refresh');
const exportButton = document.getElementById('export-stock');

const toast = createToast(toastRoot);

const state = {
  products: [],
  ledger: []
};

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

function renderProducts() {
  renderProductsTable(productsTable, productsCount, state.products, searchInput.value);
}

async function loadProducts() {
  const data = await adminApi.getProducts();
  state.products = data.items;
  renderProducts();
}

async function loadRuntimeMeta() {
  const data = await adminApi.getHealth();
  const now = new Date().toLocaleString();
  runtimeMeta.textContent = `Datos privados: ${data.adminDataDir} • Actualizado: ${now}`;
}

async function loadDashboard() {
  const dashboard = await adminApi.getDashboard(fromInput.value, toInput.value);
  renderMetrics(metricsEl, dashboard);
}

async function loadLedger() {
  const data = await adminApi.getLedger(fromInput.value, toInput.value);
  state.ledger = data.items;
  renderLedger(ledgerList, state.ledger);
}

async function refreshAll() {
  await Promise.all([loadProducts(), loadDashboard(), loadLedger(), loadRuntimeMeta()]);
}

async function saveRowFinance(row) {
  const productId = row.dataset.productId;
  const productName = row.dataset.productName ?? productId;
  const saveButton = row.querySelector('.finance-save');
  saveButton.disabled = true;

  try {
    const payload = getRowPayload(row);
    await adminApi.saveFinanceRow(productId, payload);
    await refreshAll();
    toast.success(`Datos guardados: ${productName}`);
  } catch (error) {
    const message =
      error.message === 'Not found'
        ? 'No se pudo guardar. Reinicia el admin server para cargar los endpoints nuevos.'
        : error.message;
    toast.error(message, 4200);
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
  const moveButton = row.querySelector('.row-movement-save');

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

  moveButton.disabled = true;

  try {
    await adminApi.registerMovement(payload);
    await refreshAll();
    toast.success(`Movimiento registrado: ${productName}`);
  } catch (error) {
    toast.error(error.message, 4200);
  } finally {
    moveButton.disabled = false;
  }
}

searchInput.addEventListener('input', renderProducts);

productsTable.addEventListener('input', (event) => {
  const qtyInput = event.target.closest('.row-movement-qty');
  if (!qtyInput) return;
  const row = qtyInput.closest('tr');
  if (!row) return;
  const registerButton = row.querySelector('.row-movement-save');
  const qty = Number(qtyInput.value);
  registerButton.disabled = !Number.isInteger(qty) || qty <= 0;
});

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
  if (!movementButton) return;
  const row = movementButton.closest('tr');
  if (!row) return;
  try {
    await registerRowMovement(row);
  } catch (error) {
    toast.error(error.message, 4200);
  }
});

productsTable.addEventListener('keydown', async (event) => {
  if (event.key !== 'Enter') return;

  if (event.target.classList.contains('cell-input')) {
    event.preventDefault();
    const row = event.target.closest('tr');
    if (!row) return;
    await saveRowFinance(row);
    return;
  }

  if (event.target.classList.contains('row-movement-qty')) {
    event.preventDefault();
    const row = event.target.closest('tr');
    if (!row) return;
    try {
      await registerRowMovement(row);
    } catch (error) {
      toast.error(error.message, 4200);
    }
  }
});

refreshButton.addEventListener('click', async () => {
  try {
    await Promise.all([loadDashboard(), loadLedger()]);
    toast.info('Rango actualizado');
  } catch (error) {
    toast.error(error.message, 4200);
  }
});

exportButton.addEventListener('click', async () => {
  try {
    const data = await adminApi.exportPublicStock();
    toast.success(`Stock exportado (${data.exported} registros)`);
  } catch (error) {
    toast.error(error.message, 4200);
  }
});

(async function init() {
  try {
    await refreshAll();
    toast.info('Panel listo', 1800);
  } catch (error) {
    toast.error(error.message, 4200);
  }
})();
