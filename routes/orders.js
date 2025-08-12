const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// POST /api/orders
router.post('/', authMiddleware, ordersController.createOrder);
// GET /api/orders/user
router.get('/user', authMiddleware, ordersController.getUserOrders);
// GET /api/orders/all (admin only)
router.get('/all', authMiddleware, adminMiddleware, ordersController.getAllOrders);
// PUT /api/orders/:id/status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, ordersController.updateOrderStatus);
// DELETE /api/orders/:id
router.delete('/:id', authMiddleware, ordersController.deleteOrder);

module.exports = router;