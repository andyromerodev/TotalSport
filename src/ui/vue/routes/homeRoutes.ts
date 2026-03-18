import { getImage } from 'astro:assets';
import coverDeportes from '../../../assets/store-covers/tienda-deportes.webp';
import coverTecnologias from '../../../assets/store-covers/tienda-tecnologias.webp';
import coverRegalos from '../../../assets/store-covers/tienda-regalos.webp';
import coverEmbarazadas from '../../../assets/store-covers/tienda-embarazadas.webp';
import { getStoresUseCase } from '../../../application/GetStoresUseCase';
import { getStoreProductsUseCase } from '../../../application/GetStoreProductsUseCase';
import { normalizeBaseUrl, toStoreCardUiState } from '../adapters/catalogViewModelMappers';
import type { StoreCardUiState } from '../types/catalogUiState';

const storeThemeBySlug: Record<string, { kicker: string; accent: string; soft: string }> = {
  deportes: { kicker: 'Activa', accent: '#0a7f52', soft: '#d8f1e7' },
  'tecnologia-electronica': { kicker: 'Digital', accent: '#0f4aa3', soft: '#d8e5ff' },
  regalos: { kicker: 'Detalles', accent: '#8a3f2d', soft: '#f6ddd6' },
  embarazadas: { kicker: 'Cuidado', accent: '#9a4f76', soft: '#f5dfeb' }
};

const coverImageBySlug = {
  deportes: coverDeportes,
  'tecnologia-electronica': coverTecnologias,
  regalos: coverRegalos,
  embarazadas: coverEmbarazadas
};

export async function getHomePageData(rawBaseUrl: string): Promise<StoreCardUiState[]> {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);

  const optimizedCovers = Object.fromEntries(
    await Promise.all(
      Object.entries(coverImageBySlug).map(async ([slug, image]) => {
        const optimized = await getImage({
          src: image,
          width: 420,
          widths: [420, 560],
          format: 'webp',
          quality: 60,
          sizes: '(max-width: 768px) 92vw, 377px'
        });
        return [
          slug,
          {
            src: optimized.src,
            srcSet: optimized.srcSet.attribute,
            sizes: optimized.attributes.sizes ?? '(max-width: 768px) 92vw, 377px'
          }
        ];
      })
    )
  );

  return getStoresUseCase().map((store, index) => {
    const products = getStoreProductsUseCase(store.slug);
    const cover = optimizedCovers[store.slug];
    return toStoreCardUiState(store, products.length, baseUrl, {
      coverImageUrl: cover?.src,
      coverSrcSet: cover?.srcSet,
      coverSizes: cover?.sizes,
      coverLoading: index === 0 ? 'eager' : 'lazy',
      coverFetchPriority: index === 0 ? 'high' : 'auto',
      theme: storeThemeBySlug[store.slug]
    });
  });
}
