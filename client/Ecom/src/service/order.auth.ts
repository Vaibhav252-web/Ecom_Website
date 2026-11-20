import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { authProductCartApi } from "./productCart.auth";

// Backend base URL (set VITE_API_URL in client/.env to change it)
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:4040";

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

export type PaymentMethod = "COD" | "ONLINE";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

// Place Order Request Type
export interface PlaceOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripeSessionId?: string | null;
  estimatedDelivery?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  sessionId: string;
}

export interface CancleOrderRequest {
  orderId: string;
}

// Generic API Response Type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PlaceOrderResponse {
  order: Order;
  // Stripe payment page link (null for Cash on Delivery)
  checkoutUrl: string | null;
}

export interface VerifyPaymentResponse {
  order: Order;
  paid: boolean;
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

// Turn any error (RTK Query or normal) into a readable message
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: { message?: unknown } }).data;

    if (data && typeof data.message === "string") {
      return data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

// RTK Query API
export const authOrderApi = createApi({
  reducerPath: "orderApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/order`,

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
    // Place Order (COD or ONLINE)
    placeOrder: builder.mutation<
      ApiResponse<PlaceOrderResponse>,
      PlaceOrderRequest
    >({
      query: (body) => ({
        url: "/placeOrder",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // COD clears the cart on the server, so refresh the cart data
          dispatch(authProductCartApi.util.invalidateTags(["Cart"]));
        } catch {
          // error is handled by the component
        }
      },
    }),

    // Confirm Stripe payment
    verifyPayment: builder.mutation<
      ApiResponse<VerifyPaymentResponse>,
      VerifyPaymentRequest
    >({
      query: (body) => ({
        url: "/verifyPayment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Cart is cleared on the server after a successful payment
          dispatch(authProductCartApi.util.invalidateTags(["Cart"]));
        } catch {
          // error is handled by the component
        }
      },
    }),

    // Get all orders of the logged in user
    getMyOrder: builder.query<ApiResponse<GetMyOrderResponse>, void>({
      query: () => ({
        url: "/getMyOrder",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    // Get one order by id
    getOrderById: builder.query<ApiResponse<GetOrderByIdResponse>, string>({
      query: (orderId) => ({
        url: `/getOrder/${orderId}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    // Cancel Order
    cancleOrder: builder.mutation<
      ApiResponse<CancleOrderResponse>,
      CancleOrderRequest
    >({
      query: (body) => ({
        url: "/cancleOrder",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrderQuery,
  useGetOrderByIdQuery,
  useCancleOrderMutation,
} = authOrderApi;
