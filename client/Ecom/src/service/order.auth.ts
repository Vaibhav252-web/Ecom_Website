
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Shipping Address Type
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Place Order Request Type
export interface PlaceOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "ONLINE";
}

// Order Item Type
export interface OrderItem {
  _id: string;
  product: string;
  title: string;
  price: number;
  quantity: number;
  size: string | null;
  image: string;
}

// Order Type
export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus:
    | "PLACED"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetMyOrderRequest {
  userId: string;
}

export interface GetOrderByIdRequest {
  orderId: string;
  userId: string;
}

export interface CancleOrderRequest{
  orderId: string;
  userId: string;
}


// Generic API Response Type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Place Order Response Type
export interface PlaceOrderResponse {
  order: Order;
}

export interface GetMyOrderResponse {
  myOrder: Order[];
}

export interface GetOrderByIdResponse {
  order: Order;
}

export interface CancleOrderResponse {
  order: Order;
}

// RTK Query API
export const authOrderApi = createApi({
  reducerPath: "orderApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4040/api/order",

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Order"],

  endpoints: (builder) => ({
    // Place Order
    placeOrder: builder.mutation<
      ApiResponse<PlaceOrderResponse>,
      PlaceOrderRequest
    >({
      query: (credentials) => ({
        url: "/placeOrder",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Order"],
    }),

    // Get All order
    getMyOrder: builder.query<ApiResponse<GetMyOrderResponse>, GetMyOrderRequest>({
      query: (body) => ({
        url: "/getMyOreder",
        method: "GET",
        body,
      }),
      providesTags: ["Order"],
    }),

    // Get order by the orderId
    getOrderById: builder.mutation<ApiResponse<GetOrderByIdResponse>, GetOrderByIdRequest>({
      query: (credintial) => ({
        url: "/getOrderById",
        method: "POST",
        body: credintial,
      }),
      invalidatesTags: ["Order"]
    }),

    // Cancle Order
    cancleOrder: builder.mutation<ApiResponse<CancleOrderResponse>, CancleOrderRequest>({
      query: (body) => ({
        url: "/cancleOrder",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"]
    })
  }),
});

export const { usePlaceOrderMutation } = authOrderApi;
