export type ProductVariant = {
  name: string;
  values: string[];
};

/** Shape tal como existe en los archivos products.json (sin stock). */
export type RawProduct = {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  description?: string;
  variants?: ProductVariant[];
  imageUrl?: string;
  images?: string[];
  aliases?: string[];
  active: boolean;
};

/** Entidad de dominio: RawProduct enriquecido con datos de stock. */
export type Product = RawProduct & {
  inStock: boolean;
  availableQty?: number;
};

export type StoreMeta = {
  slug: string;
  title: string;
  description: string;
};
