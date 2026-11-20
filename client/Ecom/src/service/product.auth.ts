
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand: string;
  size?: string[];
  images: string[];
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand: string;
  createdAt: string;
  size?: string[];
  images: string[];
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface GetAllProductResponse {
  AllProduct: Product[];
}

export interface GetProductResponse {
  product: Product;
}

export interface GetProductByCategoryResponse {
  products: Product[];
}

export interface GetProductRequest {
  productId: string;
}

export interface GetProductByCategoryRequest {
  productCategory: string;
}

export interface DeleteProductRequest {
  productId: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
  productId: string;
}

export const authProductApi = createApi({
  reducerPath: "productApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4040/api/product",
  }),

  tagTypes: ["Product"],

  endpoints: (builder) => ({
    createProduct: builder.mutation<ApiResponse, FormData>({
      query: (formData) => ({
        url: "/createProduct",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    getAllProduct: builder.query<
      ApiResponse<GetAllProductResponse>,
      void
    >({
      query: () => ({
        url: "/getAllProduct",
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    getProduct: builder.mutation<
      ApiResponse<GetProductResponse>,
      GetProductRequest
    >({
      query: (credential) => ({
        url: "/getProduct",
        method: "POST",
        body: credential,
      }),
    }),

    getProductByCategory: builder.mutation<
      ApiResponse<GetProductByCategoryResponse>,
      GetProductByCategoryRequest
    >({
      query: (credential) => ({
        url: "/getProductByCategory",
        method: "POST",
        body: credential,
      }),
    }),

    updateProduct: builder.mutation<ApiResponse, FormData>({
  query: (formData) => ({
    url: "/updateProduct",
    method: "POST",
    body: formData,
  }),
  invalidatesTags: ["Product"],
}),

    deleteProduct: builder.mutation<ApiResponse, DeleteProductRequest>({
      query: (credential) => ({
        url: "/deleteProduct",
        method: "DELETE",
        body: credential,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetAllProductQuery,
  useGetProductByCategoryMutation,
  useGetProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} = authProductApi;
