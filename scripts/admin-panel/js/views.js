import { currency, prettyDate } from './formatters.js';

const movementLabel = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT: 'Ajuste',
  SALE: 'Venta'
};

export function renderMetrics(metricsEl, dashboard) {
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

export function filterProducts(products, query) {
  const q = query.trim().toLowerCase();
  return products.filter((item) => {
    if (!q) return true;
    return (
      item.productId.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });
}

export function renderProductsTable(productsTable, productsCount, products, query) {
  const filtered = filterProducts(products, query);
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
              <span class="action-label">Movimiento</span>
              <div class="movement-controls">
                <select class="row-movement-type" aria-label="Tipo de movimiento para ${item.name}">
                  <option value="ENTRY">Entrada</option>
                  <option value="EXIT">Salida</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                  <option value="SALE">Venta</option>
                </select>
                <select class="row-adjustment-sign hidden" aria-label="Signo de ajuste para ${item.name}">
                  <option value="IN">Sumar</option>
                  <option value="OUT">Restar</option>
                </select>
                <input class="row-movement-qty" type="number" min="1" step="1" value="1" aria-label="Cantidad para ${item.name}" />
                <button class="row-movement-save btn-secondary" type="button">Registrar</button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

export function renderLedger(ledgerList, ledger) {
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
