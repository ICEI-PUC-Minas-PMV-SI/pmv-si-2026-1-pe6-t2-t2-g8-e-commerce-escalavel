export interface Category {
  id: string;
  name: string;
}

export interface Sku {
  id: string;
  price: number;
  code?: string | null;
}

export interface Variant {
  id: string;
  skus?: Sku[];
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  urlImg?: string | null;
  active?: boolean;
  category?: Category | null;
  variants?: Variant[];
}

export interface ProductFilters {
  name?: string;
  categoryId?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
}
