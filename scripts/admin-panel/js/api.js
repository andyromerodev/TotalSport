async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? 'Request failed');
  }
  return json;
}

export const adminApi = {
  getProducts() {
    return fetchJson('/api/products');
  },
  getHealth() {
    return fetchJson('/api/health');
  },
  getDashboard(from, to) {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    return fetchJson(`/api/dashboard?${query.toString()}`);
  },
  getLedger(from, to) {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    return fetchJson(`/api/ledger?${query.toString()}`);
  },
  saveFinanceRow(productId, payload) {
    return fetchJson(`/api/products/${encodeURIComponent(productId)}/finance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },
  registerMovement(payload) {
    return fetchJson('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },
  exportPublicStock() {
    return fetchJson('/api/export-public-stock', { method: 'POST' });
  }
};
