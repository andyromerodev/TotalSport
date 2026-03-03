import productsData from '../data/products.json';

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
  imageUrl: string;
  aliases?: string[];
  active: boolean;
};

const products = productsData as Product[];

export function getProducts(): Product[] {
  return products.filter((product) => product.active);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((product) => product.id === id);
}

export function getCategories(): string[] {
  return [...new Set(getProducts().map((product) => product.category))];
}

export function getProductsByCategory(): Map<string, Product[]> {
  return getProducts().reduce((acc, product) => {
    const list = acc.get(product.category) ?? [];
    list.push(product);
    acc.set(product.category, list);
    return acc;
  }, new Map<string, Product[]>());
}

export function buildWhatsAppLink(productName: string): string {
  const number = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
  const encoded = encodeURIComponent(`Hola, me interesa este producto: ${productName}`);

  if (number) {
    return `https://wa.me/${number}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}
