import mongoose, { Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;

  items: {
    product: mongoose.Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
    size: string | null;
    image: string;
  }[];

  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;

  paymentMethod: "COD" | "ONLINE";
  stripeSessionId?: string | null;
  estimatedDelivery?: Date | null;
  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";

  orderStatus:
    | "PLACED"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
}