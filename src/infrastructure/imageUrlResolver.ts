const IMAGE_CDN_BASE =
  'https://raw.githubusercontent.com/andyromerodev/TotalSport/main/public/images/stores';

/**
 * Devuelve la URL absoluta de una imagen de producto.
 * Si el valor ya es una URL absoluta la retorna sin cambios (retrocompatibilidad).
 */
export function resolveImageUrl(storeSlug: string, filename: string): string {
  if (filename.startsWith('http')) return filename;
  return `${IMAGE_CDN_BASE}/${storeSlug}/${filename}`;
}

/**
 * Resuelve un array de filenames a URLs absolutas.
 */
export function resolveImageUrls(storeSlug: string, filenames: string[]): string[] {
  return filenames.map((f) => resolveImageUrl(storeSlug, f));
}
