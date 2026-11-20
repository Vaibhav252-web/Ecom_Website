
export type CreateProductRequest = {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand: string;
  size: string[];
}

export interface UpdateProductBody {
  productId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand: string;
  size?: string[];
  keepImages?: string;
}

export type DeleteProductRequest = {
  productId: string;
}

export type GetProductRequest = {
  productId: string;
}

export type GetProductByCategoryRequest = {
  productCategory : string;
}