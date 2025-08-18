const express = require('express');
const router = express.Router();

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided, authorization denied'
    });
  }

  try {
    // Mock user authentication
    req.user = { id: 'user123', email: 'user@example.com' };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token is not valid'
    });
  }
};

// Mock cart storage (in real app, use database)
let userCarts = {};

// GET /api/cart - Get user's cart
router.get('/', authenticateUser, (req, res) => {
  try {
    const userId = req.user.id;
    const cart = userCarts[userId] || { items: [], total: 0 };

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

// POST /api/cart - Add item to cart
router.post('/', authenticateUser, (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, quantity, image } = req.body;

    // Validate required fields
    if (!productId || !name || !price || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, name, price, and quantity are required'
      });
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }

    // Initialize cart if it doesn't exist
    if (!userCarts[userId]) {
      userCarts[userId] = { items: [], total: 0 };
    }

    const cart = userCarts[userId];

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.id === productId);

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const newItem = {
        id: productId,
        name,
        price,
        quantity,
        image: image || null,
        addedAt: new Date().toISOString()
      };
      cart.items.push(newItem);
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// PUT /api/cart/:productId - Update item quantity in cart
router.put('/:productId', authenticateUser, (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }

    // Check if cart exists
    if (!userCarts[userId]) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const cart = userCarts[userId];
    const itemIndex = cart.items.findIndex(item => item.id == productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart'
    });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', authenticateUser, (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Check if cart exists
    if (!userCarts[userId]) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const cart = userCarts[userId];
    const itemIndex = cart.items.findIndex(item => item.id == productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', authenticateUser, (req, res) => {
  try {
    const userId = req.user.id;

    // Clear cart
    userCarts[userId] = { items: [], total: 0 };

    res.json({
      success: true,
      data: userCarts[userId],
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

// GET /api/cart/count - Get cart item count
router.get('/count', authenticateUser, (req, res) => {
  try {
    const userId = req.user.id;
    const cart = userCarts[userId] || { items: [], total: 0 };
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        itemCount,
        uniqueItems: cart.items.length,
        total: cart.total
      }
    });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart count'
    });
  }
});

module.exports = router;