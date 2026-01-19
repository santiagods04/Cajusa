const { celebrate, Joi } = require("celebrate");

const validateSignup = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().min(2).max(60).required(),
      nickname: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-z0-9._-]+$/i)
        .required(),
      email: Joi.string().required().email(),
      phone: Joi.string()
        .pattern(/^\+\d{8,15}$/)
        .required(),
      password: Joi.string().required().min(8),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    })
    .unknown(false),
});

const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validateUpdatePersonalData = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().trim().min(2).max(80).required(),
      nickname: Joi.string().trim().min(2).max(40).required(),
      phone: Joi.string()
        .trim()
        // E.164 básico: + y 7-15 dígitos (tu ejemplo +57300...)
        .pattern(/^\+?[0-9]{7,15}$/)
        .required(),
    })
    .unknown(false),
});

const validateUpdateEmail = celebrate({
  body: Joi.object()
    .keys({
      email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required(),
    })
    .unknown(false),
});

const STRONG_PASS_REGEX = /^(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/;
const validateUpdatePassword = celebrate({
  body: Joi.object()
    .keys({
      currentPassword: Joi.string().min(8).required(),
      newPassword: Joi.string().required().pattern(STRONG_PASS_REGEX).messages({
        "string.pattern.base":
          "Contraseña insegura, debe incluir al menos 8 caracteres con 1 mayúscula y 1 número",
        "string.empty":
          "Contraseña insegura, debe incluir al menos 8 caracteres con 1 mayúscula y 1 número",
        "any.required":
          "Contraseña insegura, debe incluir al menos 8 caracteres con 1 mayúscula y 1 número",
      }),
      confirmNewPassword: Joi.string()
        .required()
        .valid(Joi.ref("newPassword"))
        .messages({
          "any.only": "La confirmación de contraseña no coincide",
          "string.empty": "La confirmación de contraseña no coincide",
          "any.required": "La confirmación de contraseña no coincide",
        }),
    })
    .unknown(false),
});

const validateAddress = celebrate({
  body: Joi.object().keys({
    label: Joi.string().optional().allow(""),
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    line1: Joi.string().required(),
    line2: Joi.string().optional().allow(""),
    city: Joi.string().required(),
    state: Joi.string().optional().allow(""),
    country: Joi.string().optional().allow(""),
    postalCode: Joi.string().optional().allow(""),
    notes: Joi.string().optional().allow(""),
    isDefault: Joi.boolean().optional(),
  }),
});

const validateCartUpsert = celebrate({
  body: Joi.object().keys({
    productId: Joi.string().length(24).hex().required(),
    qty: Joi.number().min(1).required(),
    variant: Joi.object({
      size: Joi.string().optional().allow(""),
      color: Joi.string().optional().allow(""),
    }).optional(),
  }),
});

const validateProductId = celebrate({
  params: Joi.object().keys({
    productId: Joi.string().length(24).hex().required(),
  }),
});

const imageHttpUrl = Joi.string()
  .trim()
  .uri({ scheme: ["http", "https"] });
const imageDataUrl = Joi.string()
  .trim()
  .pattern(/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i);
const imageRelative = Joi.string()
  .trim()
  .pattern(/^\/[^\s]+$/);

const imageItem = Joi.alternatives().try(
  imageHttpUrl,
  imageDataUrl,
  imageRelative,
);

const variantJoi = Joi.object()
  .keys({
    size: Joi.string().trim().min(1).max(20).required(),
    color: Joi.string().trim().min(1).max(30).required(),
    quantity: Joi.number().integer().min(1).required(),
  })
  .unknown(false);

const validateCreateProduct = celebrate({
  body: Joi.object()
    .keys({
      code: Joi.string().trim().min(3).max(60).required(),
      line: Joi.string().trim().min(2).max(60).required(),
      category: Joi.string().trim().min(2).max(60).required(),
      subcategory: Joi.string().trim().min(2).max(60).required(),

      name: Joi.string().trim().min(2).max(120).required(),
      price: Joi.number().min(0).required(),
      description: Joi.string().trim().max(600).required(),

      images: Joi.array().items(imageItem).max(6).required(),
      variants: Joi.array().items(variantJoi).required(),
      tags: Joi.array()
        .items(Joi.string().trim().min(1).max(40))
        .min(1)
        .max(15)
        .required(),
    })
    .unknown(false),
});

const validateUpdateProduct = celebrate({
  body: Joi.object()
    .keys({
      line: Joi.string().trim().min(2).max(60).optional(),
      category: Joi.string().trim().min(2).max(60).optional(),
      subcategory: Joi.string().trim().min(2).max(60).optional(),

      name: Joi.string().trim().min(2).max(120).optional(),
      price: Joi.number().min(0).optional(),
      description: Joi.string().trim().min(10).max(600).optional(),

      images: Joi.array().items(imageItem).min(1).max(6).optional(),
      variants: Joi.array().items(variantJoi).optional(),
      tags: Joi.array()
        .items(Joi.string().trim().min(1).max(40))
        .min(1)
        .optional(),
    })
    .unknown(false),
});

module.exports = {
  validateSignup,
  validateSignin,
  validateAddress,
  validateCartUpsert,
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
  validateUpdatePersonalData,
  validateUpdateEmail,
  validateUpdatePassword,
};
