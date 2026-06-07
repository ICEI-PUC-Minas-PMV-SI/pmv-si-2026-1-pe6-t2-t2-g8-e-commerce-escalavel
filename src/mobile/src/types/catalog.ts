export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Sku {
  id: string;
  price: number;
  size?: string | null;
  code?: string | null;
}

export interface Variant {
  id: string;
  color?: string | null;
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

export interface ProductInput {
  name: string;
  description?: string;
  urlImg?: string;
  categoryId?: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
}
