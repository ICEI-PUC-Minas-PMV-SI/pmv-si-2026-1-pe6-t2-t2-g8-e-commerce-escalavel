import { API_URL } from '@/src/config/env';
import type { Category, CategoryInput, Product, ProductFilters, ProductInput, Sku, Variant } from '@/src/types/catalog';
import { authHeader, HttpClient } from './httpClient';

const http = new HttpClient(API_URL);

type Envelope<T> = { data?: T };

function unwrapArray<T>(payload: T[] | Envelope<T[]>): T[] {
  if (Array.isArray(payload)) return payload;
  const inner = (payload as Envelope<T[]>)?.data;
  return Array.isArray(inner) ? inner : [];
}

function unwrapObject<T>(payload: T | Envelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as Envelope<T>).data as T;
  }
  return payload as T;
}

function buildProductsQuery(filters: ProductFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.name) params.append('name', filters.name);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    params.append('minPrice', String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    params.append('maxPrice', String(filters.maxPrice));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const catalogService = {
  async getProducts(filters: ProductFilters = {}, signal?: AbortSignal): Promise<Product[]> {
    const raw = await http.get<Product[] | Envelope<Product[]>>(
      `/catalog/products${buildProductsQuery(filters)}`,
      { signal }
    );
    return unwrapArray<Product>(raw);
  },

  async getProductById(id: string, signal?: AbortSignal): Promise<Product> {
    const raw = await http.get<Product | Envelope<Product>>(`/catalog/products/${id}`, { signal });
    return unwrapObject<Product>(raw);
  },

  async getCategories(signal?: AbortSignal): Promise<Category[]> {
    const raw = await http.get<Category[] | Envelope<Category[]>>('/catalog/categories', { signal });
    return unwrapArray<Category>(raw);
  },

  async createProduct(data: ProductInput): Promise<Product> {
    const headers = await authHeader();
    const raw = await http.post<Product | Envelope<Product>>('/catalog/products', data, { headers });
    return unwrapObject<Product>(raw);
  },

  async updateProduct(id: string, data: ProductInput): Promise<Product> {
    const headers = await authHeader();
    const raw = await http.put<Product | Envelope<Product>>(`/catalog/products/${id}`, data, { headers });
    return unwrapObject<Product>(raw);
  },

  async deleteProduct(id: string): Promise<void> {
    const headers = await authHeader();
    await http.del(`/catalog/products/${id}`, { headers });
  },

  async createCategory(data: CategoryInput): Promise<Category> {
    const headers = await authHeader();
    const raw = await http.post<Category | Envelope<Category>>('/catalog/categories', data, { headers });
    return unwrapObject<Category>(raw);
  },

  async updateCategory(id: string, data: CategoryInput): Promise<Category> {
    const headers = await authHeader();
    const raw = await http.put<Category | Envelope<Category>>(`/catalog/categories/${id}`, data, { headers });
    return unwrapObject<Category>(raw);
  },

  async deleteCategory(id: string): Promise<void> {
    const headers = await authHeader();
    await http.del(`/catalog/categories/${id}`, { headers });
  },

  async createVariant(productId: string, data: { color: string; urlImg?: string }): Promise<Variant> {
    const headers = await authHeader();
    const raw = await http.post<Variant>(`/catalog/products/${productId}/variants`, data, { headers });
    return raw;
  },

  async deleteVariant(variantId: string): Promise<void> {
    const headers = await authHeader();
    await http.del(`/catalog/variants/${variantId}`, { headers });
  },

  async createSku(variantId: string, data: { size: string; code: string; price: number }): Promise<Sku> {
    const headers = await authHeader();
    const raw = await http.post<Sku>(`/catalog/variants/${variantId}/skus`, data, { headers });
    return raw;
  },

  async updateSku(skuId: string, data: { price: number }): Promise<Sku> {
    const headers = await authHeader();
    const raw = await http.patch<Sku | Envelope<Sku>>(`/catalog/skus/${skuId}`, data, { headers });
    return unwrapObject<Sku>(raw);
  },

  async deleteSku(skuId: string): Promise<void> {
    const headers = await authHeader();
    await http.del(`/catalog/skus/${skuId}`, { headers });
  },
};
