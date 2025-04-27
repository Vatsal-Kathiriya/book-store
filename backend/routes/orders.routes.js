const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All order routes require authentication
router.use(authenticate);

// Get user's orders
router.get('/my-orders', orderController.getMyOrders);

// Create a new order
router.post('/', orderController.createOrder);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;