// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordersController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// POST /api/orders - Create new order
router.post('/', authMiddleware, orderController.createOrder);

// GET /api/orders - Get user orders  
router.get('/', authMiddleware, orderController.getUserOrders);

// GET /api/orders/all - Get all orders (admin only)
router.get('/all', authMiddleware, adminMiddleware, orderController.getAllOrders);

// GET /api/orders/:id - Get single order
router.get('/:id', authMiddleware, orderController.getOrderById);

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;