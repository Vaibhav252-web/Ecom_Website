import Joi, { object } from "joi";

const registerValidation = {
  body: Joi.object({
    username: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_.]+$/)
      .required()
      .messages({
        "string.empty": "Username is required",
        "any.required": "Username is required",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must not exceed 30 characters",
        "string.pattern.base":
          "Username can only contain letters, numbers, underscore (_) and dot (.)",
      }),

    email: Joi.string().trim().email().lowercase().required().messages({
      "string.empty": "Email is required",
      "any.required": "Email is required",
      "string.email": "Invalid email format",
    }),

    role: Joi.string().trim().min(3).max(7).required().messages({
      "string.empty": "Role is required",
      "any.required": "Role is required",
      "string.min": "Role must be at least 3 characters",
      "string.max": "Role must not exceed 20 characters",
    }),

    password: Joi.string().min(8).required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
      "string.min": "Password must be at least 8 characters",
    }),

    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits",
        "any.required": "Phone number is required",
      }),

    address: Joi.string().trim().min(5).max(255).required(),

    countryCode: Joi.string()
      .pattern(/^\+[1-9]\d{0,3}$/)
      .required()
      .messages({
        "string.pattern.base": "Country code must be valid, e.g. +91 or +1",
      }),

    dob: Joi.string()
      .pattern(/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/)
      .custom((value, helpers) => {
        const [day, month, year] = value.split("-").map(Number);

        const date = new Date(year, month - 1, day);

        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          return helpers.error("any.invalid");
        }

        if (date > new Date()) {
          return helpers.error("date.max");
        }

        return value;
      })
      .required()
      .messages({
        "string.pattern.base": "DOB must be in DD-MM-YYYY format",
        "any.invalid": "Please enter a valid date of birth",
        "date.max": "Date of birth cannot be in the future",
        "any.required": "Date of birth is required",
      }),
  }),
};

const LoginValidation = {
  body: Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.empty": "Email is required",
      "any.required": "Email is required",
      "string.email": "Invalid email format",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
      "string.min": "Password must be at least 8 characters",
    }),
  }),
};

// const OTPValidation = {
//   body: Joi.object({
//     email: Joi.string().trim().email().lowercase().required().messages({
//       "string.empty": "Email is required",
//       "any.required": "Email is required",
//       "string.email": "Invalid email format",
//     }),
//   }),
// };

const VerifyOTPValidaton = {
  body: Joi.object({
    otp: Joi.string()
      .length(4)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        "string.empty": "OTP is required",
        "string.length": "OTP must be exactly 4 digits",
        "string.pattern.base": "OTP must contain only numbers",
        "any.required": "OTP is required",
      }),

    userId: Joi.string().required().messages({
      "string.empty": "UserId is required",
      "any.required": "UserId is required",
    }),
  }),
};

const GetUserValidation = {
  body: Joi.object({
    userId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': 'User ID must be a valid MongoDB ObjectId',
        'string.length': 'User ID must be exactly 24 characters long',
        'any.required': 'User ID is required'
      })
  })
};

export default {
  registerValidation,
  LoginValidation,
  // OTPValidation,
  VerifyOTPValidaton,
  GetUserValidation
};
