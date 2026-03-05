import productsData from '../data/products.json';

export type ProductVariant = {
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  name: string;
  group: string;
  category: string;
  priceUsd: number;
  description?: string;
  variants?: ProductVariant[];
  imageUrl?: string;
  images?: string[];
  aliases?: string[];
  active: boolean;
};

const products = productsData as Product[];

export const COLLECTIONS = [
  {
    slug: 'deporte-ciclismo',
    title: 'Ciclismo y Deporte',
    description: 'Ropa, componentes, termos y accesorios deportivos.'
  },
  {
    slug: 'tecnologia-electronica',
    title: 'Tecnologia y Electronica',
    description: 'Accesorios electronicos y dispositivos.'
  },
  {
    slug: 'regalos',
    title: 'Regalos',
    description: 'Articulos para obsequiar y detalles especiales.'
  },
  {
    slug: 'embarazadas',
    title: 'Embarazadas',
    description: 'Productos para embarazo y maternidad.'
  }
] as const;

export function getProducts(): Product[] {
  return products.filter((product) => product.active);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((product) => product.id === id);
}

export function getCategories(): string[] {
  return [...new Set(getProducts().map((product) => product.category))];
}

export function getCollectionBySlug(slug: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getProductsByGroup(group: string): Product[] {
  return getProducts().filter((product) => product.group === group);
}

export function getCategoriesByGroup(group: string): string[] {
  return [...new Set(getProductsByGroup(group).map((product) => product.category))];
}

export function getProductsByGroupAndCategory(group: string, category: string): Product[] {
  return getProductsByGroup(group).filter((product) => product.category === category);
}

export function getProductsByCategory(): Map<string, Product[]> {
  return getProducts().reduce((acc, product) => {
    const list = acc.get(product.category) ?? [];
    list.push(product);
    acc.set(product.category, list);
    return acc;
  }, new Map<string, Product[]>());
}

export function slugifyCategory(category: string): string {
  return category.toLowerCase().replaceAll(' ', '-');
}

export function getCategoryBySlug(slug: string): string | undefined {
  return getCategories().find((category) => slugifyCategory(category) === slug);
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
