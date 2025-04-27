const express = require('express');
const {
    // ...existing imports...
    getOrders,
    updateOrderStatus,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ...existing routes...

// Order routes
router.route('/orders').get(protect, admin, getOrders);
// Ensure this route is properly defined for PUT requests
router.route('/orders/:id/status')
      .put(protect, admin, updateOrderStatus); // Order status update endpoint

// ...existing routes...

module.exports = router;
