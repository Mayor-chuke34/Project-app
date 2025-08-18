const express = require('express');
const router = express.Router();

// Middleware to authenticate user (simple version)
const authenticateUser = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided, authorization denied'
    });
  }

  try {
    // In a real app, you'd verify the JWT token here
    // For now, we'll just pass through
    req.user = { id: 'user123', email: 'user@example.com' };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token is not valid'
    });
  }
};

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateUser, (req, res) => {
  try {
    // Mock user data
    const userData = {
      id: req.user.id,
      name: 'John Doe',
      email: req.user.email,
      phone: '+234 800 123 4567',
      address: {
        street: '123 Lagos Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      },
      joinedAt: '2024-01-15T10:00:00.000Z',
      orderCount: 5,
      totalSpent: 125000
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateUser, (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone are required'
      });
    }

    // Mock update response
    const updatedUser = {
      id: req.user.id,
      name,
      email: req.user.email,
      phone,
      address: address || {},
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// GET /api/users/wishlist - Get user's wishlist
router.get('/wishlist', authenticateUser, (req, res) => {
  try {
    // Mock wishlist data
    const wishlistItems = [
      {
        id: 1,
        name: "iPhone 15 Pro",
        price: 450000,
        image: "https://dummyjson.com/image/1",
        addedAt: "2024-01-20T10:00:00.000Z"
      },
      {
        id: 2,
        name: "MacBook Air M2",
        price: 750000,
        image: "https://dummyjson.com/image/2",
        addedAt: "2024-01-22T14:30:00.000Z"
      }
    ];

    res.json({
      success: true,
      data: wishlistItems
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist'
    });
  }
});

// POST /api/users/wishlist - Add item to wishlist
router.post('/wishlist', authenticateUser, (req, res) => {
  try {
    const { productId, name, price, image } = req.body;

    // Validate required fields
    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, name, and price are required'
      });
    }

    // Mock adding to wishlist
    const wishlistItem = {
      id: productId,
      name,
      price,
      image: image || null,
      addedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: wishlistItem,
      message: 'Item added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to wishlist'
    });
  }
});

// DELETE /api/users/wishlist/:productId - Remove item from wishlist
router.delete('/wishlist/:productId', authenticateUser, (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    // Mock removal from wishlist
    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from wishlist'
    });
  }
});

// GET /api/users/orders - Get user's orders
router.get('/orders', authenticateUser, (req, res) => {
  try {
    // Mock orders data
    const orders = [
      {
        id: 'ORD-001',
        status: 'Delivered',
        total: 75000,
        items: 2,
        createdAt: '2024-01-15T10:00:00.000Z',
        deliveredAt: '2024-01-17T14:30:00.000Z'
      },
      {
        id: 'ORD-002',
        status: 'Processing',
        total: 120000,
        items: 1,
        createdAt: '2024-01-20T09:15:00.000Z',
        estimatedDelivery: '2024-01-25T17:00:00.000Z'
      }
    ];

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/users/notifications - Get user's notifications
router.get('/notifications', authenticateUser, (req, res) => {
  try {
    // Mock notifications
    const notifications = [
      {
        id: 1,
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #ORD-001 has been delivered successfully',
        read: false,
        createdAt: '2024-01-17T14:30:00.000Z'
      },
      {
        id: 2,
        type: 'promotion',
        title: 'Special Offer',
        message: '20% off on all electronics this weekend!',
        read: true,
        createdAt: '2024-01-16T08:00:00.000Z'
      }
    ];

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Notification ID is required'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

module.exports = router;