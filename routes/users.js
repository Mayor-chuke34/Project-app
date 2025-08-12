const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require('../controllers/usersControllers');

// Get user profile
router.get('/profile', auth, getUserProfile);

// Update user profile
router.put('/profile', auth, updateUserProfile);

// Change password
router.put('/change-password', auth, changePassword);

// Get all users (admin only)
router.get('/', auth, adminAuth, getAllUsers);

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, deleteUser);

// Wishlist routes
router.post('/wishlist', auth, addToWishlist);
router.delete('/wishlist/:productId', auth, removeFromWishlist);
router.get('/wishlist', auth, getWishlist);

module.exports = router;