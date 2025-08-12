// routes/wishlist.js - Create this new file
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/auth');

// GET /api/wishlist
router.get('/', authMiddleware, wishlistController.getUserWishlist);
// POST /api/wishlist
router.post('/', authMiddleware, wishlistController.addToWishlist);
// DELETE /api/wishlist/:productId
router.delete('/:productId', authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;
