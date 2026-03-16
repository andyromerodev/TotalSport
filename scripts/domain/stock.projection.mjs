export function buildPublicStock(finance, catalogProducts, updatedAt = new Date().toISOString()) {
  const financeById = new Map(finance.map((record) => [record.productId, record]));

  return catalogProducts
    .filter((product) => product.active)
    .map((product) => {
      const record = financeById.get(product.productId);
      if (!record) {
        return {
          productId: product.productId,
          inStock: true,
          updatedAt
        };
      }

      return {
        productId: product.productId,
        inStock: record.currentStock > 0,
        availableQty: record.currentStock,
        updatedAt
      };
    })
    .sort((a, b) => a.productId.localeCompare(b.productId));
}
