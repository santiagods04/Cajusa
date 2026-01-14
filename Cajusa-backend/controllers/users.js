const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/user');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

const { NODE_ENV, JWT_SECRET = 'dev-secret' } = process.env;

const signToken = (userId) => jwt.sign(
  { _id: userId },
  NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
  { expiresIn: '7d' }
);

const createUser = (req, res, next) => {
  const { name, nickname, email, phone, password } = req.body;

  if (!password || password.length < 8) {
    return next(new BadRequestError('La contraseña debe tener al menos 8 caracteres'));
  }

  return bcrypt.hash(password, 10)
    .then((hash) => User.create({ name, nickname, email, phone, password: hash }))
    .then((user) => res.status(201).send({ _id: user._id, name: user.name, nickname: user.nickname, phone: user.phone, email: user.email, role: user.role }))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => res.send({ token: signToken(user._id) }))
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') return next(new NotFoundError('Usuario no encontrado'));
      return next(err);
    });
};

const addAddress = (req, res, next) => {
  const address = req.body;

  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      if (address.isDefault) {
        user.addresses.forEach((a) => { a.isDefault = false; });
      }

      if (user.addresses.length === 0) {
        address.isDefault = true;
      }

      user.addresses.push(address);
      return user.save();
    })
    .then((user) => res.send(user.addresses))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') return next(new NotFoundError('Usuario no encontrado'));
      return next(err);
    });
};

const setDefaultAddress = (req, res, next) => {
  const { addressId } = req.params;

  if (!mongoose.isValidObjectId(addressId)) {
    return next(new BadRequestError('ID inválido'));
  }

  return User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const addr = user.addresses.id(addressId);
      if (!addr) throw new NotFoundError('Dirección no encontrada');

      user.addresses.forEach((a) => { a.isDefault = false; });
      addr.isDefault = true;

      return user.save();
    })
    .then((user) => res.send(user.addresses))
    .catch(next);
};

const deleteAddress = (req, res, next) => {
  const { addressId } = req.params;

  if (!mongoose.isValidObjectId(addressId)) {
    return next(new BadRequestError('ID inválido'));
  }

  return User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const addr = user.addresses.id(addressId);
      if (!addr) throw new NotFoundError('Dirección no encontrada');

      const wasDefault = addr.isDefault;
      addr.deleteOne();

      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      return user.save();
    })
    .then((user) => res.send(user.addresses))
    .catch(next);
};

const toggleFavorite = (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return next(new BadRequestError('ID inválido'));
  }

  return User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const idx = user.favorites.findIndex((id) => String(id) === String(productId));
      const wantsAdd = req.method === 'PUT';

      if (wantsAdd && idx === -1) user.favorites.push(productId);
      if (!wantsAdd && idx !== -1) user.favorites.splice(idx, 1);

      return user.save();
    })
    .then((user) => res.send({ favorites: user.favorites }))
    .catch(next);
};

const upsertCartItem = (req, res, next) => {
  const { productId, qty, variant = {} } = req.body;

  return User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const item = user.cart.find((i) => (
        String(i.productId) === String(productId)
        && String(i.variant?.size || '') === String(variant.size || '')
        && String(i.variant?.color || '') === String(variant.color || '')
      ));

      if (item) {
        item.qty = qty;
      } else {
        user.cart.push({ productId, qty, variant });
      }

      return user.save();
    })
    .then((user) => res.send({ cart: user.cart }))
    .catch(next);
};

const removeCartItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.isValidObjectId(itemId)) {
    return next(new BadRequestError('ID inválido'));
  }

  return User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const item = user.cart.id(itemId);
      if (!item) throw new NotFoundError('Item del carrito no encontrado');
      item.deleteOne();
      return user.save();
    })
    .then((user) => res.send({ cart: user.cart }))
    .catch(next);
};

const clearCart = (req, res, next) => (
  User.findByIdAndUpdate(req.user._id, { cart: [] }, { new: true })
    .then((user) => res.send({ cart: user.cart }))
    .catch(next)
);

module.exports = {
  createUser,
  login,
  getCurrentUser,
  addAddress,
  setDefaultAddress,
  deleteAddress,
  toggleFavorite,
  upsertCartItem,
  removeCartItem,
  clearCart,
};
