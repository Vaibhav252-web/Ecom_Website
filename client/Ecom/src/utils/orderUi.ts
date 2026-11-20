import { API_BASE_URL } from "../service/order.auth";
import type { Order } from "../service/order.auth";

export type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export const formatPrice = (amount: number): string =>
  `₹${amount.toLocaleString("en-IN")}`;

export const formatDate = (value: string): string =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const orderStatusColor = (status: string): ChipColor => {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "CANCELLED":
    case "RETURNED":
      return "error";
    case "SHIPPED":
      return "info";
    case "CONFIRMED":
    case "PROCESSING":
      return "primary";
    default:
      return "warning";
  }
};

export const paymentStatusColor = (status: string): ChipColor => {
  switch (status) {
    case "PAID":
      return "success";
    case "FAILED":
      return "error";
    case "REFUNDED":
      return "info";
    default:
      return "warning";
  }
};

// Product images are stored as "/uploads/xxx.png" on the backend
export const imageUrl = (image?: string): string => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

// Fallback for old orders that were saved before delivery dates existed
const DEFAULT_DELIVERY_DAYS = 5;

export const formatDay = (value: string | Date): string =>
  new Date(value).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Expected delivery date of an order, or null if it will not be delivered
export const getDeliveryText = (order: Order): string | null => {
  if (order.orderStatus === "CANCELLED" || order.orderStatus === "RETURNED") {
    return null;
  }

  if (order.orderStatus === "DELIVERED") {
    return `Delivered on ${formatDay(order.updatedAt)}`;
  }

  if (order.estimatedDelivery) {
    return `Expected by ${formatDay(order.estimatedDelivery)}`;
  }

  const fallback = new Date(order.createdAt);
  fallback.setDate(fallback.getDate() + DEFAULT_DELIVERY_DAYS);

  return `Expected by ${formatDay(fallback)}`;
};
