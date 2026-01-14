const mongoose = require('mongoose');
const Product = require('../models/product');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

const parseList = (value) => (value ? String(value).split(',').map((s) => s.trim()).filter(Boolean) : []);

const getProducts = (req, res, next) => {
  const {
    line, category, subcategory, tag, q,
    size, color, available,
    page = 1, limit = 20,
    sort = '-createdAt',
  } = req.query;

  const filter = {};

  const lines = parseList(line);
  const categories = parseList(category);
  const subcategories = parseList(subcategory);
  const tags = parseList(tag);

  if (lines.length) filter.line = { $in: lines };
  if (categories.length) filter.category = { $in: categories };
  if (subcategories.length) filter.subcategory = { $in: subcategories };
  if (tags.length) filter.tags = { $in: tags };

  if (q) filter.name = { $regex: String(q), $options: 'i' };

  // Filtrar por variantes (size/color/available)
  if (size || color || typeof available !== 'undefined') {
    const v = {};
    if (size) v.size = String(size);
    if (color) v.color = String(color);
    if (typeof available !== 'undefined') v.available = String(available) === 'true';

    filter.variants = { $elemMatch: v };
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  return Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean()
    .then((products) => res.send(products))
    .catch(next);
};

const getProductById = (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return next(new BadRequestError('ID inválido'));
  }

  return Product.findById(productId)
    .orFail()
    .lean()
    .then((product) => res.send(product))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') return next(new NotFoundError('Producto no encontrado'));
      return next(err);
    });
};

const createProduct = (req, res, next) => Product.create(req.body)
  .then((product) => res.status(201).send(product))
  .catch(next);

const updateProduct = (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return next(new BadRequestError('ID inválido'));
  }

  const { code, ...safeBody } = req.body;

  return Product.findByIdAndUpdate(
    productId,
    safeBody,
    { new: true, runValidators: true },
  )
    .orFail()
    .then((product) => res.send(product))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') return next(new NotFoundError('Producto no encontrado'));
      return next(err);
    });
};

const deleteProduct = (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return next(new BadRequestError('ID inválido'));
  }

  return Product.findById(productId)
    .orFail()
    .then((product) => Product.deleteOne({ _id: product._id }).then(() => product))
    .then((product) => res.send(product))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') return next(new NotFoundError('Producto no encontrado'));
      return next(err);
    });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
