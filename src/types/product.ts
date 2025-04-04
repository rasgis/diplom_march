export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  unitOfMeasure: string;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}
