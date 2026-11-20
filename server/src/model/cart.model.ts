import mongoose from "mongoose";
import { ICart } from "../type/DB/cart";
import { required } from "joi";

const cartSchema = new mongoose.Schema<ICart>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },

        size: {
          type: String,
          default: null,
        },
      },
    ],
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
