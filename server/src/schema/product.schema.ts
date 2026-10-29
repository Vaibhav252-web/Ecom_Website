import Joi from "joi";

const CreateProductValidation = {
  body: Joi.object({
    title: Joi.string().trim().min(2).max(150).required().messages({
      "string.empty": "Product title is required",
      "string.min": "Product title must be at least 2 characters",
      "string.max": "Product title must not exceed 150 characters",
      "any.required": "Product title is required",
    }),

    description: Joi.string().trim().min(5).required().messages({
      "string.empty": "Product description is required",
      "string.min": "Description must be at least 5 characters",
      "any.required": "Product description is required",
    }),

    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a valid number",
      "number.min": "Price cannot be negative",
      "any.required": "Product price is required",
    }),

    category: Joi.string().trim().required().messages({
      "string.empty": "Product category is required",
      "any.required": "Product category is required",
    }),

    stock: Joi.number().integer().min(0).required().messages({
      "number.base": "Stock must be a valid number",
      "number.integer": "Stock must be an integer",
      "number.min": "Stock cannot be negative",
      "any.required": "Product stock is required",
    }),

    brand: Joi.string().trim().required().messages({
      "string.empty": "Product brand is required",
      "any.required": "Product brand is required",
    }),
    size: Joi.array()
  .items(Joi.string().valid("SM", "MD", "LG"))
  .unique()
  .messages({
    "array.base": "Sizes must be an array",
    "string.base": "Each size must be a string",
    "any.only": "Size must be SM, MD, or LG",
    "array.unique": "Duplicate sizes are not allowed",
  }),

  images: Joi.array()
    .items(Joi.string().trim().min(1))
    .max(5)
    .optional(),
  }),
};

const UpdateProductValidation = {
  body: Joi.object({
    productId: Joi.string()
      .hex()
      .length(24)
      .required(),

    title: Joi.string().trim().min(2).max(150),

    description: Joi.string().trim().min(5),

    price: Joi.number().min(0),

    category: Joi.string().trim(),

    stock: Joi.number().integer().min(0),

    brand: Joi.string().trim(),

    // FormData se JSON string aayegi
    size: Joi.string()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);

          const { error } = Joi.array()
            .items(Joi.string().valid("SM", "MD", "LG"))
            .unique()
            .validate(parsed);

          if (error) {
            return helpers.error("any.invalid");
          }

          return value;
        } catch {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid": "Sizes must be a valid JSON array containing SM, MD, or LG",
      }),

    // Existing image paths jo preserve karne hain
    keepImages: Joi.string()
      .custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);

          if (
            !Array.isArray(parsed) ||
            !parsed.every((item) => typeof item === "string")
          ) {
            return helpers.error("any.invalid");
          }

          return value;
        } catch {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid": "keepImages must be a valid JSON array",
      }),
  })
    .min(2)
    .custom((value, helpers) => {
      const updateFields = [
        "title",
        "description",
        "price",
        "category",
        "stock",
        "brand",
        "size",
        "keepImages",
      ];

      if (!updateFields.some((field) => field in value)) {
        return helpers.error("any.custom");
      }

      return value;
    })
    .messages({
      "object.min": "Product ID and at least one update field are required",
      "any.custom": "Provide at least one field to update",
    }),
};

const DeleteProductValidation = {
  body: Joi.object({
    productId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        "string.empty": "Product ID is required",
        "string.hex": "Product ID must be a valid MongoDB ObjectId",
        "string.length": "Product ID must be exactly 24 characters long",
        "any.required": "Product ID is required",
      }),
  }),
};

const GetProductValidation = {
  body: Joi.object({
    productId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        "string.empty": "Product ID is required",
        "string.hex": "Product ID must be a valid MongoDB ObjectId",
        "string.length": "Product ID must be exactly 24 characters long",
        "any.required": "Product ID is required",
      }),
  }),
};

const GetProductByCategoryValidation = {
  body: Joi.object({
    productCategory: Joi.string().trim().required().messages({
      "string.empty": "Product category is required",
      "any.required": "Product category is required",
    }),
  }),
};

export default {
  CreateProductValidation,
  UpdateProductValidation,
  DeleteProductValidation,
  GetProductValidation,
  GetProductByCategoryValidation,
};
