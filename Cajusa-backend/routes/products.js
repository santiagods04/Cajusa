const router = require('express').Router();

const auth = require('../middlewares/auth');
const requireAdmin = require('../middlewares/require-admin');

const {
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
} = require('../middlewares/validation');

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products');

// Públicas (catálogo)
router.get('/', getProducts);
router.get('/:productId', validateProductId, getProductById);

// Admin (CRUD)
router.post('/', auth, requireAdmin, validateCreateProduct, createProduct);
router.patch('/:productId', auth, requireAdmin, validateProductId, validateUpdateProduct, updateProduct);
router.delete('/:productId', auth, requireAdmin, validateProductId, deleteProduct);

module.exports = router;
