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

// POST /api/orders - Create new order
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      shippingAddress,
      paymentMethod,
      items,
      total,
      status
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !shippingAddress || !paymentMethod || !items || !total) {
      return res.status(400).json({
        success: false,
        error: 'All order details are required'
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item'
      });
    }

    // Validate shipping address
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state) {
      return res.status(400).json({
        success: false,
        error: 'Complete shipping address is required'
      });
    }

    // Generate order ID
    // Generate order ID using array join instead of string concatenation
    const orderId = ['ORD', Date.now()].join('-');

    // Calculate total from items (validation)
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - total) > 1) { // Allow 1 naira difference for rounding
      return res.status(400).json({
        success: false,
        error: 'Order total does not match item prices'
      });
    }

    // Create order object
    const newOrder = {
      id: orderId,
      userId: userId || req.user.id,
      orderNumber: orderId,
      customerInfo: {
        fullName,
        email,
        phone
      },
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.price * item.quantity
      })),
      pricing: {
        subtotal: calculatedTotal,
        deliveryFee: 0,
        tax: 0,
        total: calculatedTotal
      },
      status: status || 'Pending',
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days from now
      trackingInfo: {
        trackingNumber: `TRK-${orderId}`,
        carrier: 'NaijaShop Express',
        status: 'Order Placed'
      }
    };

    // In real app, save to database
    console.log('New Order Created:', newOrder);

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// GET /api/orders - Get user's orders
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Mock orders data
    let orders = [
      {
        id: 'ORD-1704876543210',
        orderNumber: 'ORD-1704876543210',
        status: 'Delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        total: 125000,
        itemCount: 2,
        orderDate: '2024-01-10T10:00:00.000Z',
        deliveredAt: '2024-01-15T14:30:00.000Z',
        items: [
          {
            name: 'iPhone 15 Pro',
            quantity: 1,
            price: 100000,
            image: 'https://dummyjson.com/image/1'
          },
          {
            name: 'AirPods Pro',
            quantity: 1,
            price: 25000,
            image: 'https://dummyjson.com/image/2'
          }
        ]
      },
      {
        id: 'ORD-1705049143210',
        orderNumber: 'ORD-1705049143210',
        status: 'Processing',
        paymentStatus: 'paid',
        paymentMethod: 'transfer',
        total: 75000,
        itemCount: 1,
        orderDate: '2024-01-12T09:15:00.000Z',
        estimatedDelivery: '2024-01-20T17:00:00.000Z',
        items: [
          {
            name: 'Samsung Galaxy Buds',
            quantity: 1,
            price: 75000,
            image: 'https://dummyjson.com/image/3'
          }
        ]
      },
      {
        id: 'ORD-1705135543210',
        orderNumber: 'ORD-1705135543210',
        status: 'Pending',
        paymentStatus: 'pending',
        paymentMethod: 'cod',
        total: 45000,
        itemCount: 3,
        orderDate: '2024-01-13T16:45:00.000Z',
        estimatedDelivery: '2024-01-22T12:00:00.000Z',
        items: [
          {
            name: 'Phone Case',
            quantity: 2,
            price: 15000,
            image: 'https://dummyjson.com/image/4'
          },
          {
            name: 'Screen Protector',
            quantity: 1,
            price: 15000,
            image: 'https://dummyjson.com/image/5'
          }
        ]
      }
    ];

    // Filter by status if provided
    if (status) {
      orders = orders.filter(order => 
        order.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(orders.length / parseInt(limit)),
        totalOrders: orders.length,
        hasNext: endIndex < orders.length,
        hasPrev: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock order details
    const orderDetails = {
      id: id,
      orderNumber: id,
      userId: req.user.id,
      status: 'Processing',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      customerInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+234 800 123 4567'
      },
      shippingAddress: {
        address: '123 Lagos Street, Victoria Island',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      },
      items: [
        {
          productId: 1,
          name: 'iPhone 15 Pro',
          price: 100000,
          quantity: 1,
          image: 'https://dummyjson.com/image/1',
          subtotal: 100000
        }
      ],
      pricing: {
        subtotal: 100000,
        deliveryFee: 0,
        tax: 0,
        total: 100000
      },
      orderDate: '2024-01-13T10:00:00.000Z',
      estimatedDelivery: '2024-01-20T17:00:00.000Z',
      trackingInfo: {
        trackingNumber: ['TRK', id].join('-'),
        carrier: 'NaijaShop Express',
        status: 'In Transit',
        updates: [
          {
            status: 'Order Placed',
            message: 'Your order has been placed successfully',
            timestamp: '2024-01-13T10:00:00.000Z',
            location: 'Lagos, Nigeria'
          },
          {
            status: 'Processing',
            message: 'Your order is being prepared',
            timestamp: '2024-01-13T14:30:00.000Z',
            location: 'Warehouse, Lagos'
          },
          {
            status: 'In Transit',
            message: 'Your order is on the way',
            timestamp: '2024-01-14T08:15:00.000Z',
            location: 'Distribution Center, Lagos'
          }
        ]
      }
    };

    res.json({
      success: true,
      data: orderDetails
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details'
    });
  }
});

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Mock order cancellation
    const cancelledOrder = {
      id: id,
      status: 'Cancelled',
      cancellationReason: reason || 'Customer requested cancellation',
      cancelledAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: cancelledOrder,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    });
  }
});

// GET /api/orders/:id/track - Track order
router.get('/:id/track', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock tracking information
    const trackingInfo = {
      orderId: id,
      trackingNumber: `TRK-${id}`,
      carrier: 'NaijaShop Express',
      currentStatus: 'In Transit',
      estimatedDelivery: '2024-01-20T17:00:00.000Z',
      updates: [
        {
          status: 'Order Placed',
          message: 'Your order has been placed successfully',
          timestamp: '2024-01-13T10:00:00.000Z',
          location: 'Lagos, Nigeria'
        },
        {
          status: 'Processing',
          message: 'Your order is being prepared',
          timestamp: '2024-01-13T14:30:00.000Z',
          location: 'Warehouse, Lagos'
        },
        {
          status: 'In Transit',
          message: 'Your order is on the way',
          timestamp: '2024-01-14T08:15:00.000Z',
          location: 'Distribution Center, Lagos'
        },
        {
          status: 'Out for Delivery',
          message: 'Your order is out for delivery',
          timestamp: '2024-01-15T06:00:00.000Z',
          location: 'Local Delivery Hub'
        }
      ]
    };

    res.json({
      success: true,
      data: trackingInfo
    });

  } catch (error) {
    console.error('Error fetching tracking info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tracking information'
    });
  }
});

module.exports = router;