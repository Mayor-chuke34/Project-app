// routes/wishlist.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/auth');

// GET /api/wishlist - Get user wishlist
router.get('/', authMiddleware, wishlistController.getUserWishlist);

// POST /api/wishlist - Add to wishlist
router.post('/', authMiddleware, wishlistController.addToWishlist);

// DELETE /api/wishlist/:productId - Remove from wishlist
router.delete('/:productId', authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;