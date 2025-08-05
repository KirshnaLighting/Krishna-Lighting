const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  clearCart
} = require('../controllers/cart.controller');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:itemId', removeFromCart);
router.put('/:itemId', updateCartItem);
router.delete('/clear', clearCart);

module.exports = router;