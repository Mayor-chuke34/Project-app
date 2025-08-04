const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/orders
router.post('/', authMiddleware, ordersController.createOrder);

module.exports = router;
