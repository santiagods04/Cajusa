const { celebrate, Joi } = require('celebrate');

const validateSignup = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(60).required(),
    nickname: Joi.string().min(3).max(30).pattern(/^[a-z0-9._-]+$/i).required(),
    email: Joi.string().required().email(),
    phone: Joi.string().pattern(/^\+\d{8,15}$/).required(),
    password: Joi.string().required().min(8),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }).unknown(false),
});


const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validateAddress = celebrate({
  body: Joi.object().keys({
    label: Joi.string().optional().allow(''),
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    line1: Joi.string().required(),
    line2: Joi.string().optional().allow(''),
    city: Joi.string().required(),
    state: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    postalCode: Joi.string().optional().allow(''),
    notes: Joi.string().optional().allow(''),
    isDefault: Joi.boolean().optional(),
  }),
});

const validateCartUpsert = celebrate({
  body: Joi.object().keys({
    productId: Joi.string().length(24).hex().required(),
    qty: Joi.number().min(1).required(),
    variant: Joi.object({
      size: Joi.string().optional().allow(''),
      color: Joi.string().optional().allow(''),
    }).optional(),
  }),
});

const validateProductId = celebrate({
  params: Joi.object().keys({
    productId: Joi.string().length(24).hex().required(),
  }),
});

const variantJoi = Joi.object().keys({
  size: Joi.string().optional().allow(''),
  color: Joi.string().optional().allow(''),
  available: Joi.boolean().optional(),
});

const validateCreateProduct = celebrate({
  body: Joi.object().keys({
    code: Joi.string().min(3).max(60).required(),
    line: Joi.string().min(2).max(60).required(),
    category: Joi.string().min(2).max(60).required(),
    subcategory: Joi.string().max(60).optional().allow(''),

    name: Joi.string().min(2).max(120).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().max(2000).optional().allow(''),

    images: Joi.array().items(Joi.string().min(1)).optional(),
    variants: Joi.array().items(variantJoi).optional(),
    tags: Joi.array().items(Joi.string().min(1).max(40)).optional(),
  }).unknown(false),
});

const validateUpdateProduct = celebrate({
  body: Joi.object().keys({
    line: Joi.string().min(2).max(60).optional(),
    category: Joi.string().min(2).max(60).optional(),
    subcategory: Joi.string().max(60).optional().allow(''),

    name: Joi.string().min(2).max(120).optional(),
    price: Joi.number().min(0).optional(),
    description: Joi.string().max(2000).optional().allow(''),

    images: Joi.array().items(Joi.string().min(1)).optional(),
    variants: Joi.array().items(variantJoi).optional(),
    tags: Joi.array().items(Joi.string().min(1).max(40)).optional(),
  }).unknown(false),
});


module.exports = {
  validateSignup,
  validateSignin,
  validateAddress,
  validateCartUpsert,
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
};
