import { Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  stock: number;
  brand: string;
  size: string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}