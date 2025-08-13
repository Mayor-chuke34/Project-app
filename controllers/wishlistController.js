// controllers/wishlistController.js
const User = require('../models/User');

// GET user wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ADD to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    
    res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// REMOVE from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    
    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};