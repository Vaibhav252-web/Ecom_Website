import { Request, Response, NextFunction } from "express";
import { Success, TryCatch } from "../utils/helper";
import Product from "../model/product.model";
import ErrorHandler from "../utils/ErrorHandler";
import { AddToCartRequest, removeFromCartRequest } from "../type/API/productCart";
import Cart from "../model/cart.model";
import mongoose from "mongoose";

// Add to cart
const addToCart = TryCatch(
  async (
    req: Request<{}, {}, AddToCartRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    const { productId, quantity = 1, size = null } = req.body;
    const { userId } = req;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found!", 404));
    }

    if (!userId) {
      return next(new ErrorHandler("Please login first", 401));
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    let existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size,
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        _id: new mongoose.Types.ObjectId(),
        product: new mongoose.Types.ObjectId(productId),
        quantity,
        size,
      });
    }

    await cart.save();

    const upDateCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title price image",
    );

    Success(res, 200, "Product Added to cart sucessfully", { upDateCart });
  },
);

// clear all cart
// const clearCart = TryCatch(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { cartId } = req.body;

//     const cart = await Cart.findById(cartId);

//     if (!cart) {
//       return next(new ErrorHandler("Cart not found!", 404));
//     }

//     await Cart.findByIdAndDelete(cartId);

//     return Success(res, 200, "Cart clear");
//   },
// );

//  Get Cart
const getCart = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "title price images",
    );

    if (!cart) {
      return Success(res, 200, "Cart is empty", {
        data: {
          items: [],
          totalItems: 0,
          subtotal: 0,
        },
      });
    }

    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    cart.subtotal = cart.items.reduce((total, item) => {
      const product = item.product as any;
      return total + product.price * item.quantity;
    }, 0);

    return Success(res, 200, "Cart fetched successfully", { cart },
    );
  },
);

// Remove from Cart
const removeFromCart = TryCatch(
  async (req: Request<{}, {}, removeFromCartRequest>, res: Response, next: NextFunction) => {
    const { cartItemId } = req.body;
    const { userId } = req;

    if (!userId) {
      return next(new ErrorHandler("Please login first", 401));
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    const itemExists = cart.items.some(
      (item) => item._id.toString() === cartItemId,
    );

    if (!itemExists) {
      return next(new ErrorHandler("Item not exists", 404));
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== cartItemId,
    );

    await cart.save();

    Success(res, 200, "Item removed from cart successfully", { data: cart });
  },
);

const quantityAddOrSubtract = TryCatch(async(req: Request, res: Response, next:NextFunction) => {
  const {productId, action} = req.body;
  const {userId} = req;

  if(!['increnment', 'decrenment'].includes(action)){
    return next(new ErrorHandler("Invalid action", 400))
  }

  const product = await Product.findById(productId)
  if(!product){
    return next(new ErrorHandler("Product not found", 404))
  }

  const cart = await Cart.findOne({ user: userId });
  if(!cart){
    return next(new ErrorHandler("Cart not found", 404))
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

  if(itemIndex === -1){
    return next(new ErrorHandler("Product not found on your cart", 404))
  }

  const currentQuantity = cart.items[itemIndex].quantity

  if(action === "increnment"){
    if(currentQuantity + 1 > product.stock){
      return next(new ErrorHandler( `Only ${product.stock} units available in stock.`, 400))
    }
    cart.items[itemIndex].quantity += 1
  } else if( action === "decrenment"){
    if (currentQuantity <= 1) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity -= 1;
      }
  }

  await cart.save()

  return Success(res, 200, "Product quantity is updated sucessfully")

  // cart.totalItems = cart.items.reduce(
  //     (total, item) => total + item.quantity,
  //     0,
  //   );

})

export const productCartController = {
  addToCart,
  // clearCart,
  getCart,
  removeFromCart,
  quantityAddOrSubtract,
};
