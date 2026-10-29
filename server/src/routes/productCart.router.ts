import express from "express";
import { validate } from "../middleware/validate.middleware";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { productCartController } from "../controllers/productCart.controller";

const productCartRouter = express.Router();

productCartRouter.post(
  "/addToCart",
  AuthMiddleware(["user"]),
  productCartController.addToCart,
);

productCartRouter.post(
  "/removeFromCart",
  AuthMiddleware(["user"]),
  productCartController.removeFromCart,
);

productCartRouter.get(
  "/getCart",
  AuthMiddleware(["user"]),
  productCartController.getCart,
)

productCartRouter.post(
  "/updateQuantity",
  AuthMiddleware(["user"]),
  productCartController.quantityAddOrSubtract,
)



export default productCartRouter;
