// controllers/wishlistController.js - Create this new file
const User = require('../models/User');

// GET user wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    // You'll need to add wishlist field to User model or create separate Wishlist model
    const user = await User.findById(req.userId).populate('wishlist');
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ADD to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.userId);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// REMOVE from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};