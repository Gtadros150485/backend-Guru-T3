export interface Product {
  id: number;
  name: string;
  category: string;
  vendor: string;
  article: string;
  rating: number;
  price: number;
  imageUrl?: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  search?: string;
  sortBy?: 'name' | 'vendor' | 'article' | 'rating' | 'price';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
