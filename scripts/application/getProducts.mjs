import { loadCatalogProducts } from '../infrastructure/jsonCatalogReader.mjs';
import { loadAdminData } from '../infrastructure/jsonAdminRepository.mjs';
import { bootstrapFinanceFromCatalog } from '../domain/inventory.rules.mjs';

export function withCatalogMeta(finance, catalog) {
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

export function filterFinanceRecords(records, query) {
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

export async function getProducts(query = {}) {
  const catalog = await loadCatalogProducts();
  const { finance } = await loadAdminData();
  const mergedFinance = bootstrapFinanceFromCatalog(catalog, finance);
  const records = withCatalogMeta(mergedFinance, catalog);
  const filtered = filterFinanceRecords(records, query);
  const stores = [...new Set(records.map((item) => item.storeSlug))].sort();
  const categories = [...new Set(records.map((item) => item.category))].sort();

  return { items: filtered, stores, categories };
}
