// routes/cart.js - Create this new file
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');

// All cart routes require authentication
router.use(authMiddleware);

// GET /api/cart
router.get('/', cartController.getCart);

// POST /api/cart (add item)
router.post('/', cartController.addToCart);

// PUT /api/cart/update (update item quantity)
router.put('/update', cartController.updateCartItem);

// DELETE /api/cart/:productId (remove specific item)
router.delete('/:productId', cartController.removeFromCart);

// DELETE /api/cart/clear (clear entire cart)
router.delete('/clear', cartController.clearCart);

module.exports = router;