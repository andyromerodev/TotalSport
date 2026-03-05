import storesMetaData from '../data/stores/index.json';
import deportesProductsData from '../data/stores/deportes/products.json';
import tecnologiaProductsData from '../data/stores/tecnologia-electronica/products.json';
import regalosProductsData from '../data/stores/regalos/products.json';
import embarazadasProductsData from '../data/stores/embarazadas/products.json';

export type ProductVariant = {
  name: string;
  values: string[];
};

export type Product = {
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

export type StoreMeta = {
  slug: string;
  title: string;
  description: string;
};

const stores = storesMetaData as StoreMeta[];

const storeProductsMap: Record<string, Product[]> = {
  deportes: deportesProductsData as Product[],
  'tecnologia-electronica': tecnologiaProductsData as Product[],
  regalos: regalosProductsData as Product[],
  embarazadas: embarazadasProductsData as Product[]
};

export function getStores(): StoreMeta[] {
  return stores;
}

export function getStoreBySlug(slug: string): StoreMeta | undefined {
  return getStores().find((store) => store.slug === slug);
}

export function getStoreProducts(slug: string): Product[] {
  return (storeProductsMap[slug] ?? []).filter((product) => product.active);
}

export function getStoreCategories(slug: string): string[] {
  return [...new Set(getStoreProducts(slug).map((product) => product.category))];
}

export function getStoreProductsByCategory(slug: string, category: string): Product[] {
  return getStoreProducts(slug).filter((product) => product.category === category);
}

export function getProducts(): Product[] {
  return getStores().flatMap((store) => getStoreProducts(store.slug));
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((product) => product.id === id);
}

export function slugifyCategory(category: string): string {
  return category.toLowerCase().replaceAll(' ', '-');
}

export function buildWhatsAppLink(productName: string): string {
  const number = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
  const encoded = encodeURIComponent(`Hola, me interesa este producto: ${productName}`);

  if (number) {
    return `https://wa.me/${number}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}

export function getProductImages(product: Product): string[] {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  if (product.imageUrl) {
    return [product.imageUrl];
  }

  return [];
}

export function findStoreSlugByCategorySlug(categorySlug: string): string | undefined {
  for (const store of getStores()) {
    const match = getStoreCategories(store.slug).find((category) => slugifyCategory(category) === categorySlug);
    if (match) return store.slug;
  }
  return undefined;
}
