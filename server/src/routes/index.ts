import express from "express";
import userRouter from "./user.router";
import productRouter from "./product.router";
import productCartRouter from "./productCart.router";
import orderRoter from "./order.router";

const router = express.Router();

router.use("/user", userRouter);
router.use("/product", productRouter);
router.use("/cart", productCartRouter);
router.use("/order", orderRoter)

export default router;
