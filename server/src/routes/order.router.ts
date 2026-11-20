import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { orderController } from "../controllers/order.controller";

const orderRoter = express.Router();

// Place order (COD or ONLINE)
orderRoter.post(
  "/placeOrder",
  AuthMiddleware(["user"]),
  orderController.placeOrder,
);

// Confirm Stripe payment after redirect
orderRoter.post(
  "/verifyPayment",
  AuthMiddleware(["user"]),
  orderController.verifyPayment,
);

// All orders of logged-in user
orderRoter.get(
  "/getMyOrder",
  AuthMiddleware(["user"]),
  orderController.getMyOrders,
);

// Single order
orderRoter.get(
  "/getOrder/:orderId",
  AuthMiddleware(["user"]),
  orderController.getOrderById,
);

// Old POST route kept so nothing else breaks
orderRoter.post(
  "/getOrderById",
  AuthMiddleware(["user"]),
  orderController.getOrderById,
);

// Cancel order
orderRoter.post(
  "/cancleOrder",
  AuthMiddleware(["user"]),
  orderController.cancelOrder,
);

export default orderRoter;
