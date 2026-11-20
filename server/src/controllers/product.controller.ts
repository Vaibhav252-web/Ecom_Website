import {Request, Response, NextFunction} from 'express'
import Product from '../model/product.model'
import { Success, TryCatch } from '../utils/helper'
import ErrorHandler from '../utils/ErrorHandler';
import { CreateProductRequest, DeleteProductRequest, GetProductByCategoryRequest, GetProductRequest, UpdateProductBody } from '../type/API/product';



const createProducts = TryCatch(
  async (
    req: Request<{}, {}, CreateProductRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      title,
      description,
      price,
      category,
      stock,
      brand,
      size,
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return next(
        new ErrorHandler("At least one product image is required", 400)
      );
    }

    if (
      !title ||
      !description ||
      price == null ||
      !category ||
      stock == null ||
      !brand
    ) {
      return next(
        new ErrorHandler("Enter the required fields", 400)
      );
    }

    const images = files.map(
      (file) => `/uploads/${file.filename}`
    );

    const newProduct = await Product.create({
      title,
      description,
      price,
      category,
      stock,
      brand,
      size,
      images,
    });

    if (newProduct.stock === 0) {
      newProduct.isActive = false;
      await newProduct.save();
    }

    Success(res, 201, "Product created successfully", {
      product: newProduct,
    });
  }
);


export const updateProducts = TryCatch(
  async (
    req: Request<{}, {}, UpdateProductBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      productId,
      title,
      description,
      price,
      category,
      stock,
      brand,
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;

    // 1. Validate required fields
    if (
      !productId ||
      !title?.trim() ||
      !description?.trim() ||
      price === undefined ||
      price === null ||
      !category ||
      stock === undefined ||
      stock === null ||
      !brand?.trim()
    ) {
      return next(
        new ErrorHandler("Enter all required fields", 400)
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      return next(
        new ErrorHandler("Invalid price or stock", 400)
      );
    }

    // 2. Find existing product
    const product = await Product.findById(productId);

    if (!product) {
      return next(
        new ErrorHandler("Product not found", 404)
      );
    }

    // 3. Parse sizes sent through FormData
    let parsedSizes: string[] = [];

    try {
      if (typeof req.body.size === "string") {
        parsedSizes = JSON.parse(req.body.size);
      } else if (Array.isArray(req.body.size)) {
        parsedSizes = req.body.size;
      }
    } catch {
      return next(
        new ErrorHandler("Invalid size format", 400)
      );
    }

    if (
      !Array.isArray(parsedSizes) ||
      !parsedSizes.every((item) => typeof item === "string")
    ) {
      return next(
        new ErrorHandler("Sizes must be an array of strings", 400)
      );
    }

    // 4. Parse existing images the user wants to keep.
    // If keepImages is omitted, preserve all current images.
    let keepImages: string[];

    const currentImages: string[] = product.images ?? [];

    try {
  keepImages =
    req.body.keepImages === undefined
      ? [...currentImages]
      : JSON.parse(req.body.keepImages);
} catch {
  return next(
    new ErrorHandler("Invalid keepImages format", 400)
  );
}

    if (
      !Array.isArray(keepImages) ||
      !keepImages.every((image) => typeof image === "string")
    ) {
      return next(
        new ErrorHandler("keepImages must be an array of image paths", 400)
      );
    }

    // Only allow paths already belonging to this product.
    const invalidImage = keepImages.some(
  (image) => !currentImages.includes(image)
);

    if (invalidImage) {
      return next(
        new ErrorHandler("Invalid existing image path", 400)
      );
    }

    // 5. Get paths for newly uploaded files.
    const uploadedImages = (files ?? []).map(
      (file) => `/uploads/${file.filename}`
    );

    // Preserve selected old images and append new images.
    const finalImages = [...keepImages, ...uploadedImages];

    if (finalImages.length === 0) {
      return next(
        new ErrorHandler("At least one product image is required", 400)
      );
    }

    if (finalImages.length > 5) {
      return next(
        new ErrorHandler("Maximum 5 product images are allowed", 400)
      );
    }

    // 6. Update product details and images.
    product.title = title.trim();
    product.description = description.trim();
    product.price = numericPrice;
    product.category = category;
    product.stock = numericStock;
    product.brand = brand.trim();
    product.size = parsedSizes;
    product.images = finalImages;

    product.isActive = numericStock > 0;

    await product.save();

    // 7. Return updated product.
    return Success(res, 200, "Product updated successfully", {
      product,
    });
  }
);

const deleteProducts = TryCatch(async(req: Request<{}, {}, DeleteProductRequest>, res: Response, next: NextFunction) => {
  const {productId} = req.body;

  if(!productId){
    return next(new ErrorHandler("Product Id is required", 400))
  }

  const product = await Product.findById(productId)
  if(!product){
    return next(new ErrorHandler("Product not found", 404))
  }

  const deleteProduct = await Product.findByIdAndUpdate(
    productId,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  )

  if(!deleteProduct){
    return next(new ErrorHandler("Product is not deleted", 400))
  }

  Success(res, 200, "Product is deleted", {})

})

const getAllProducts = TryCatch(async(req: Request, res: Response, next: NextFunction) => {
  const AllProduct = await Product.find({isDeleted: false})
  if(!AllProduct){
    return next(new ErrorHandler("No product found", 404))
  }

  Success(res, 200, "Here your all product", {AllProduct})
})

const getProduct = TryCatch(async(req: Request<{}, {}, GetProductRequest>, res: Response, next: NextFunction) => {
  const {productId} = req.body

  if(!productId){
    return next(new ErrorHandler("Product Id is required", 400))
  }

  const product = await Product.findById(productId)
  if(!product){
    return next(new ErrorHandler("Product not found", 404))
  }


  Success(res, 200, "Here your product", {product})
})

const getProductByCategory = TryCatch(async(req: Request<{}, {}, GetProductByCategoryRequest>, res: Response, next: NextFunction) => {
  const {productCategory} = req.body

  if(!productCategory){
    return next(new ErrorHandler("Product Category is required", 400))
  }

  const products = await Product.aggregate([
      {
        $match: {
          category: productCategory,
          isDeleted: false,
          isActive: true,
        },
      },
    ]);


  if(!products){
    return next(new ErrorHandler("No product found", 404))
  }

  Success(res, 200, "Here your searched product", {products})

})


export const productController = {
  createProducts,
  updateProducts,
  deleteProducts,
  getAllProducts,
  getProduct,
  getProductByCategory
}

// shoes for nike : 6acdeaf7be541f6f22329fb5

// shoes for adidas: 6acdeb68952dc1c1d526db0f

// clothing for zudio : 6acdebdbb52bd86885376b0e