import { IProduct } from "../type/DB/product";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      enum: ["Women", "Men", "Kids", "Foot_Wear", "Electronics", "Accessories"],
    },

    size: {
      type: [String],
      required: true,
      enum: ["SM", "MD", "LG"],
    },

    images: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    brand: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
productSchema.index({ title: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
