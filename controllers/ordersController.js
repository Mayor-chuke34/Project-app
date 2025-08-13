// controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');

// CREATE new order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo } = req.body;
    
    // Validation
    if (!items || !items.length) {
      return res.status(400).json({ 
        success: false,
        message: 'Order items are required' 
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({ 
        success: false,
        message: 'Shipping address is required' 
      });
    }

    // Validate shipping address fields
    const { street, city, state } = shippingAddress;
    if (!street || !city || !state) {
      return res.status(400).json({ 
        success: false,
        message: 'Complete shipping address (street, city, state) is required' 
      });
    }

    // Calculate total amount from items
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order
    const order = new Order({
      userId: req.user.id, // Use userId to match schema
      items,
      totalAmount,
      shippingAddress,
      paymentInfo: paymentInfo || { method: 'card', status: 'pending' },
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    // Clear user's cart after successful order
    const user = await User.findById(req.user.id);
    if (user) {
      user.cart = [];
      await user.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating order',
      error: err.message 
    });
  }
};

// GET user orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching user orders',
      error: err.message 
    });
  }
};

// GET single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching order',
      error: err.message 
    });
  }
};

// GET all orders (ADMIN ONLY)
exports.getAllOrders = async (req, res) => {
  try {
    // Check if user is admin (additional safety check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching orders',
      error: err.message 
    });
  }
};

// UPDATE order status (ADMIN ONLY)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: Admin access required' 
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status value' 
      });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating order status',
      error: err.message 
    });
  }
};

// CANCEL order (User can cancel their own orders)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    order.status = 'cancelled';
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error cancelling order',
      error: err.message 
    });
  }
};