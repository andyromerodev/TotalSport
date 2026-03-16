import { loadAdminData } from '../infrastructure/jsonAdminRepository.mjs';

export async function getLedgerUseCase({ productId, from, to } = {}) {
  const { ledger } = await loadAdminData();

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

  return { items: filtered };
}
