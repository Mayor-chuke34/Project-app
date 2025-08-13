// controllers/cartController.js
const User = require('../models/User');

// GET user cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        cart: user.cart || [],
        count: user.cart?.length || 0
      }
    });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching cart',
      error: err.message 
    });
  }
};

// ADD to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: 'Product ID is required' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }

    // Check if product already exists in cart
    const existingItem = user.cart.find(item => item.productId.toString() === productId.toString());
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      user.cart.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    await user.save();
    
    res.json({ 
      success: true,
      message: 'Product added to cart',
      data: {
        cart: user.cart,
        count: user.cart.length
      }
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error adding to cart',
      error: err.message 
    });
  }
};

// UPDATE cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity < 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid product ID and quantity are required' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const cartItem = user.cart.find(item => item.productId.toString() === productId.toString());
    
    if (!cartItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found in cart' 
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      user.cart = user.cart.filter(item => item.productId.toString() !== productId.toString());
    } else {
      // Update quantity
      cartItem.quantity = quantity;
    }

    await user.save();
    
    res.json({ 
      success: true,
      message: 'Cart updated successfully',
      data: {
        cart: user.cart,
        count: user.cart.length
      }
    });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating cart',
      error: err.message 
    });
  }
};

// REMOVE from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const initialLength = user.cart?.length || 0;
    user.cart = user.cart?.filter(item => item.productId.toString() !== productId) || [];
    
    if (user.cart.length === initialLength) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found in cart' 
      });
    }

    await user.save();
    
    res.json({ 
      success: true,
      message: 'Product removed from cart',
      data: {
        cart: user.cart,
        count: user.cart.length
      }
    });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error removing from cart',
      error: err.message 
    });
  }
};

// CLEAR cart
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    user.cart = [];
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: [],
        count: 0
      }
    });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error clearing cart',
      error: err.message 
    });
  }
};