
import express from "express";
import { productController } from "../controllers/product.controller";
import { validate } from "../middleware/validate.middleware";
import upload from "../middleware/upload.middleware";
import productSchema from "../schema/product.schema";

const productRouter = express.Router();

productRouter.post(
  "/createProduct",
  upload.array("images", 5),
  validate(productSchema.CreateProductValidation),
  productController.createProducts
);

productRouter.post(
  "/updateProduct",
  upload.array("images", 5),
  validate(productSchema.UpdateProductValidation),
  productController.updateProducts
);

productRouter.delete(
  "/deleteProduct",
  validate(productSchema.DeleteProductValidation),
  productController.deleteProducts
);

productRouter.get(
  "/getAllProduct",
  productController.getAllProducts
);

productRouter.post(
  "/getProduct",
  validate(productSchema.GetProductValidation),
  productController.getProduct
);

productRouter.post(
  "/getProductByCategory",
  validate(productSchema.GetProductByCategoryValidation),
  productController.getProductByCategory
);

export default productRouter;
