const router = require('express').Router();
const {
  getCurrentUser,
  addAddress,
  setDefaultAddress,
  deleteAddress,
  toggleFavorite,
  upsertCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/users');

const { validateAddress, validateCartUpsert } = require('../middlewares/validation');

router.get('/me', getCurrentUser);
// Direcciones
router.post('/me/addresses', validateAddress, addAddress);
router.patch('/me/addresses/:addressId/default', setDefaultAddress);
router.delete('/me/addresses/:addressId', deleteAddress);

// Favoritos
router.put('/me/favorites/:productId', toggleFavorite);
router.delete('/me/favorites/:productId', toggleFavorite);

// Carrito
router.put('/me/cart', validateCartUpsert, upsertCartItem);
router.delete('/me/cart/:itemId', removeCartItem);
router.delete('/me/cart', clearCart);

module.exports = router;
