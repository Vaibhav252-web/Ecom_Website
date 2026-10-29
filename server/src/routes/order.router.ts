import express from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { orderController } from '../controllers/order.controller';

const orderRoter = express.Router()

orderRoter.post(
  "/placeOrder",
  AuthMiddleware(["user"]),
  orderController.placeOrder,
)

orderRoter.get(
  "/getMyOrder",
  AuthMiddleware(["user"]),
  orderController.getMyOrders
)

orderRoter.post(
  "/getOrderById",
  AuthMiddleware(["user"]),
  orderController.getOrderById,
)

orderRoter.post(
  "/cancleOrder",
  AuthMiddleware(["user"]),
  orderController.cancelOrder,
)

export default orderRoter;