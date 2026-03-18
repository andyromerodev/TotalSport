import { getAllProductsUseCase } from '../../../application/GetAllProductsUseCase';
import { getProductByIdUseCase } from '../../../application/GetProductByIdUseCase';
import { getProductImages } from '../../../lib/productImages';
import { normalizeBaseUrl, toProductDetailUiState } from '../adapters/catalogViewModelMappers';
import type { Product } from '../../../domain/catalog.types';
import type { ProductDetailUiState } from '../types/catalogUiState';

export function getStaticPaths() {
  return getAllProductsUseCase().map((product) => ({ params: { id: product.id } }));
}

export function getProductPageData(
  productId: string,
  rawBaseUrl: string
): { product: Product; uiState: ProductDetailUiState; shareImage: string } | null {
  const product = getProductByIdUseCase(productId);
  if (!product) return null;
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const uiState = toProductDetailUiState(product, baseUrl);
  const shareImage = getProductImages(product)[0] ?? 'https://placehold.co/900x900?text=Sin+foto';
  return { product, uiState, shareImage };
}
