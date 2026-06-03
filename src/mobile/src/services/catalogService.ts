import { API_URL } from '@/src/config/env';
import type { Category, Product, ProductFilters } from '@/src/types/catalog';
import { HttpClient } from './httpClient';

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
    const raw = await http.get<Product | Envelope<Product>>(`/catalog/products/${id}`, {
      signal,
    });
    return unwrapObject<Product>(raw);
  },
  async getCategories(signal?: AbortSignal): Promise<Category[]> {
    const raw = await http.get<Category[] | Envelope<Category[]>>('/catalog/categories', {
      signal,
    });
    return unwrapArray<Category>(raw);
  },
};
