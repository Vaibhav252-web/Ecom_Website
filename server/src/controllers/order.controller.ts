import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import Cart from "../model/cart.model";
import Product from "../model/product.model";
import { Order } from "../model/order.model";
import { Success, TryCatch } from "../utils/helper";
import ErrorHandler from "../utils/ErrorHandler";
import { getClientUrl, getStripe } from "../utils/stripe";
import { PlaceOrderRequest } from "../type/API/order";

type OrderDoc = InstanceType<typeof Order>;

// An order can only be cancelled before it is shipped
const CANCELLABLE = ["PLACED", "CONFIRMED", "PROCESSING"] as const;

// Orders are expected to arrive this many days after they are placed
const DELIVERY_DAYS = 5;

const getEstimatedDelivery = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + DELIVERY_DAYS);
  return date;
};

// Give the reserved stock back to the products
const restoreStock = async (order: OrderDoc) => {
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity } },
    );
  }
};

// Place a order (COD or ONLINE via Stripe)
const placeOrder = TryCatch(
  async (req: Request<{}, {}, PlaceOrderRequest>, res: Response) => {
    const { shippingAddress, paymentMethod } = req.body;
    const { userId } = req;

    // 1. Validate user
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
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
      throw new ErrorHandler("Please provide a complete shipping address", 400);
    }

    // 3. Validate payment method
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      throw new ErrorHandler("Please enter a valid payment method", 400);
    }

    const session = await mongoose.startSession();

    // Holder object so TypeScript does not narrow the value to "null"
    const holder: { order: OrderDoc | null } = { order: null };

    try {
      await session.withTransaction(async () => {
        // 4. Fetch logged-in user's cart
        const cart = await Cart.findOne({ user: userId }).session(session);

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
          const product = await Product.findById(cartItem.product).session(
            session,
          );

          if (!product || product.isDeleted || !product.isActive) {
            throw new ErrorHandler("One or more products are unavailable", 400);
          }

          const quantity = cartItem.quantity;
          const selectedSize = cartItem.size;

          if (!Number.isInteger(quantity) || quantity < 1) {
            throw new ErrorHandler("Invalid product quantity", 400);
          }

          // 6. Validate selected size
          if (selectedSize && !product.size.includes(selectedSize)) {
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

          const updatedProduct = await Product.findOneAndUpdate(
            stockFilter,
            { $inc: { stock: -quantity } },
            { new: true, session },
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
        const totalAmount = subtotal + shippingFee + tax - discount;

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
              estimatedDelivery: getEstimatedDelivery(),
              paymentMethod,
              paymentStatus: "PENDING",
              orderStatus: "PLACED",
            },
          ],
          { session },
        );

        holder.order = orders[0];

        // 11. COD: order is final, so clear the cart now.
        //     ONLINE: cart is cleared only after the payment is confirmed,
        //     so the user does not lose the cart if payment is cancelled.
        if (paymentMethod === "COD") {
          cart.items.splice(0, cart.items.length);
          cart.totalItems = 0;
          cart.subtotal = 0;

          await cart.save({ session });
        }
      });
    } finally {
      // 12. Always close the session
      await session.endSession();
    }

    const order = holder.order;

    if (!order) {
      throw new ErrorHandler("Order could not be created", 500);
    }

    // ---------- COD ----------
    if (paymentMethod === "COD") {
      return Success(res, 201, "Order placed successfully", {
        order,
        checkoutUrl: null,
      });
    }

    // ---------- ONLINE (Stripe Checkout) ----------
    try {
      const stripe = getStripe();
      const clientUrl = getClientUrl();

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: order._id.toString(),
        metadata: { orderId: order._id.toString() },
        line_items: order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "inr",
            // Stripe wants the smallest unit (paise)
            unit_amount: Math.round(item.price * 100),
            product_data: {
              name: item.size ? `${item.title} (${item.size})` : item.title,
            },
          },
        })),
        success_url: `${clientUrl}/order-success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/payment-cancelled?orderId=${order._id}`,
      });

      order.stripeSessionId = checkoutSession.id;
      await order.save();

      return Success(res, 201, "Redirecting to payment", {
        order,
        checkoutUrl: checkoutSession.url,
      });
    } catch (error) {
      // Stripe failed: undo the order so stock is not stuck
      await Order.updateOne(
        { _id: order._id },
        { $set: { orderStatus: "CANCELLED", paymentStatus: "FAILED" } },
      );
      await restoreStock(order);

      throw error;
    }
  },
);

// Confirm an ONLINE payment after Stripe redirects back to the site
const verifyPayment = TryCatch(
  async (
    req: Request<{}, {}, { orderId: string; sessionId: string }>,
    res: Response,
  ) => {
    const { orderId, sessionId } = req.body;
    const { userId } = req;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ErrorHandler("Please login first", 401);
    }

    if (!mongoose.Types.ObjectId.isValid(orderId) || !sessionId) {
      throw new ErrorHandler("Invalid payment details", 400);
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      throw new ErrorHandler("Order not found", 404);
    }

    // Already confirmed (page refreshed) -> just return it
    if (order.paymentStatus === "PAID") {
      return Success(res, 200, "Payment already confirmed", {
        order,
        paid: true,
      });
    }

    if (order.orderStatus === "CANCELLED") {
      throw new ErrorHandler("This order was cancelled", 400);
    }

    if (
      order.paymentMethod !== "ONLINE" ||
      !order.stripeSessionId ||
      order.stripeSessionId !== sessionId
    ) {
      throw new ErrorHandler("Payment session does not match this order", 400);
    }

    // Ask Stripe directly - never trust the browser
    const checkoutSession = await getStripe().checkout.sessions.retrieve(
      sessionId,
    );

    const isPaid =
      checkoutSession.payment_status === "paid" &&
      checkoutSession.metadata?.orderId === order._id.toString();

    if (isPaid) {
      order.paymentStatus = "PAID";
      order.orderStatus = "CONFIRMED";
      await order.save();

      // Payment done -> now clear the cart
      await Cart.updateOne(
        { user: userId },
        { $set: { items: [], totalItems: 0, subtotal: 0 } },
      );
    }

    return Success(
      res,
      200,
      isPaid ? "Payment successful" : "Payment not completed yet",
      { order, paid: isPaid },
    );
  },
);

// Get all orders of the logged-in user (latest first)
const getMyOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorHandler("Please login", 401));
    }

    const myOrder = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return Success(res, 200, "Here is your Orders", { myOrder });
  },
);

// Get Order by Id (GET /getOrder/:orderId)
const getOrderById = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = String(req.params.orderId ?? req.body?.orderId ?? "");
    const { userId } = req;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorHandler("Please login first", 401));
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    return Success(res, 200, "Here is your order", { order });
  },
);

// Cancel Order (restores stock, refunds paid online orders)
const cancelOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body;
    const { userId } = req;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorHandler("Please login first", 401));
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new ErrorHandler("Invalid order ID", 400));
    }

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    if (!(CANCELLABLE as readonly string[]).includes(order.orderStatus)) {
      return next(
        new ErrorHandler(
          `Order cannot be cancelled because it is ${order.orderStatus.toLowerCase()}`,
          400,
        ),
      );
    }

    let paymentStatus: OrderDoc["paymentStatus"] = order.paymentStatus;

    if (order.paymentMethod === "ONLINE" && order.stripeSessionId) {
      const stripe = getStripe();
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        order.stripeSessionId,
      );

      if (checkoutSession.payment_status === "paid") {
        // Money was taken (even if we have not confirmed it yet) -> refund it
        const paymentIntentId =
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : checkoutSession.payment_intent?.id;

        if (paymentIntentId) {
          await stripe.refunds.create({ payment_intent: paymentIntentId });
        }

        paymentStatus = "REFUNDED";
      } else {
        // Not paid: close the payment page so nobody can pay for a cancelled order
        if (checkoutSession.status === "open") {
          try {
            await stripe.checkout.sessions.expire(order.stripeSessionId);
          } catch {
            // Already expired - nothing to do
          }
        }

        paymentStatus = "FAILED";
      }
    }

    // Atomic update: guarantees stock is restored only once
    const cancelledOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: userId,
        orderStatus: { $in: [...CANCELLABLE] },
      },
      { $set: { orderStatus: "CANCELLED", paymentStatus } },
      { new: true, runValidators: true },
    );

    if (!cancelledOrder) {
      return next(new ErrorHandler("Order was already updated", 409));
    }

    await restoreStock(cancelledOrder);

    return Success(res, 200, "Order cancelled successfully", {
      order: cancelledOrder,
    });
  },
);

export default cancelOrder;

export const orderController = {
  placeOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
