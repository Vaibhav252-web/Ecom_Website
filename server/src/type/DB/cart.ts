import { Schema, Document, Types } from "mongoose";

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  size: string | null;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}
