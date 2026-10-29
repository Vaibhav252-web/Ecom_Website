import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
  size?: string | null;
}

export interface RemoveFromCartRequest {
  cartItemId: string;
}

export interface UpdateQuantityRequest {
  productId: string;
  action: string;
}

export interface Product {
  _id: string;
  title: string;
  price: number;
  image?: string;
  images?: string[];
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  size: string | null;
}

export interface CartData {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}


export interface AddToCartResponse {
  upDateCart: CartData;
}


export interface GetCartResponse {
  cart?: CartData;
  items?: CartItem[];
  totalItems: number;
  subtotal: number;
}


export interface RemoveFromCartResponse {
  data: CartData;
}


export const authProductCartApi = createApi({
  reducerPath: "productCartApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4040/api/cart",
    prepareHeaders: (headers) => {
  const token = localStorage.getItem("token");

  console.log("Token exists:", !!token);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;}

  }),

  tagTypes: ["Cart"],

  endpoints: (builder) => ({
    // Add to cart
    addToCart: builder.mutation<
      ApiResponse<AddToCartResponse>,
      AddToCartRequest
    >({
      query: (body) => ({
        url: "/addToCart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Get cart
    getCart: builder.query<ApiResponse<GetCartResponse>, void>({
      query: () => ({
        url: "/getCart",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation<
      ApiResponse<RemoveFromCartResponse>,
      RemoveFromCartRequest
    >({
      query: (body) => ({
        url: "/removeFromCart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    // update quantity
    updateQuantity: builder.mutation<ApiResponse, UpdateQuantityRequest>({
      query: (body) => ({
        url: "/updateQuantity",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateQuantityMutation,
} = authProductCartApi;
