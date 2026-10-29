
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import Cart from "../model/cart.model";
import Product from "../model/product.model";
import { Order } from "../model/order.model";
import { Success, TryCatch } from "../utils/helper";
import ErrorHandler from "../utils/ErrorHandler";
import { PlaceOrderRequest } from "../type/API/order";


// Place a order
const placeOrder = TryCatch(
  async (req: Request<{}, {}, PlaceOrderRequest>, res: Response) => {
    const { shippingAddress, paymentMethod } = req.body;
    const { userId } = req;

    // 1. Validate user
    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new ErrorHandler("Please login first", 401);
    }

    // 2. Validate address
    if (
      !shippingAddress ||
      typeof shippingAddress.fullName !== "string" ||
      typeof shippingAddress.phone !== "string" ||
      typeof shippingAddress.addressLine !== "string" ||
      typeof shippingAddress.city !== "string" ||
      typeof shippingAddress.state !== "string" ||
      typeof shippingAddress.postalCode !== "string" ||
      typeof shippingAddress.country !== "string" ||
      !shippingAddress.fullName.trim() ||
      !shippingAddress.phone.trim() ||
      !shippingAddress.addressLine.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.state.trim() ||
      !shippingAddress.postalCode.trim() ||
      !shippingAddress.country.trim()
    ) {
      throw new ErrorHandler(
        "Please provide a complete shipping address",
        400,
      );
    }

    // 3. Validate payment method
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      throw new ErrorHandler(
        "Please enter a valid payment method",
        400,
      );
    }

    const session = await mongoose.startSession();

    try {
      let createdOrder: InstanceType<typeof Order> | null =
        null;

      await session.withTransaction(async () => {
        // 4. Fetch logged-in user's cart
        const cart = await Cart.findOne({
          user: userId,
        }).session(session);

        if (!cart || cart.items.length === 0) {
          throw new ErrorHandler("Cart is empty", 400);
        }

        const orderItems: Array<{
          product: mongoose.Types.ObjectId;
          title: string;
          price: number;
          quantity: number;
          size: string | null;
          image: string;
        }> = [];

        let subtotal = 0;

        // 5. Validate each product
        for (const cartItem of cart.items) {
          const product = await Product.findById(
            cartItem.product,
          ).session(session);

          if (
            !product ||
            product.isDeleted ||
            !product.isActive
          ) {
            throw new ErrorHandler(
              "One or more products are unavailable",
              400,
            );
          }

          const quantity = cartItem.quantity;
          const selectedSize = cartItem.size;

          if (
            !Number.isInteger(quantity) ||
            quantity < 1
          ) {
            throw new ErrorHandler(
              "Invalid product quantity",
              400,
            );
          }

          // 6. Validate selected size
          if (
            selectedSize &&
            !product.size.includes(selectedSize)
          ) {
            throw new ErrorHandler(
              `${product.title} is not available in size ${selectedSize}`,
              400,
            );
          }

          // 7. Atomically decrement available stock
          const stockFilter: Record<string, unknown> = {
            _id: product._id,
            isDeleted: false,
            isActive: true,
            stock: { $gte: quantity },
          };

          if (selectedSize) {
            stockFilter.size = selectedSize;
          }

          const updatedProduct =
            await Product.findOneAndUpdate(
              stockFilter,
              { $inc: { stock: -quantity } },
              {
                new: true,
                session,
              },
            );

          if (!updatedProduct) {
            throw new ErrorHandler(
              `Insufficient stock for ${product.title}`,
              409,
            );
          }

          // 8. Save product snapshot in order
          orderItems.push({
            product: product._id,
            title: product.title,
            price: product.price,
            quantity,
            size: selectedSize ?? null,
            image: product.images[0] ?? "",
          });

          subtotal += product.price * quantity;
        }

        // 9. Calculate total on the server
        const shippingFee = 0;
        const tax = 0;
        const discount = 0;

        const totalAmount =
          subtotal + shippingFee + tax - discount;

        // 10. Create order
        const orders = await Order.create(
          [
            {
              user: userId,
              items: orderItems,
              shippingAddress,
              subtotal,
              shippingFee,
              tax,
              discount,
              totalAmount,
              paymentMethod,
              paymentStatus: "PENDING",
              orderStatus: "PLACED",
            },
          ],
          { session },
        );

        createdOrder = orders[0];

        // 11. Clear cart only after order creation
        cart.items.splice(0, cart.items.length);
        cart.totalItems = 0;
        cart.subtotal = 0;

        await cart.save({ session });
      });

      if (!createdOrder) {
        throw new ErrorHandler(
          "Order could not be created",
          500,
        );
      }

      return Success(
        res,
        201,
        "Order created successfully",
        { order: createdOrder },
      );
    } finally {
      // 12. Always close the session
      await session.endSession();
    }
  },
);

// Get all order
const getMyOrders = TryCatch(async(req: Request, res: Response, next: NextFunction) => {
  const {userId} = req;

  if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
    return next(new ErrorHandler("Please login", 401))
  }

  const myOrder = await Order.find({user: userId})
  if(!myOrder){
    return next(new ErrorHandler("Order not found",404))
  }

  return Success(res, 200, "Hereis your Orders", {myOrder})
})


// Get Order by Id
const getOrderById = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body;
    const { userId } = req;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return next(
        new ErrorHandler("Please login first", 401)``
      );
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(
        new ErrorHandler("Invalid order ID", 400)
      );
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return next(
        new ErrorHandler("Order not found", 404)
      );
    }

    return Success(
      res,
      200,
      "Here is your order",
      { order }
    );
  }
);

// Cancle Order
const cancelOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body;
    const { userId } = req;

    // Check login
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorHandler("Please login first", 401));
    }

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    // Find and cancel only the logged-in user's order
    const cancelledOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: userId,
      },
      {
        $set: { orderStatus: "CANCELLED" },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!cancelledOrder) {
      return next(
        new ErrorHandler("Order not found", 404)
      );
    }

    return Success(res, 200, "Order cancelled successfully", {
      order: cancelledOrder,
    });
  }
);

export default cancelOrder;


export const orderController = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
};
