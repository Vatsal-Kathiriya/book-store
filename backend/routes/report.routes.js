const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// All report routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Report routes
router.get('/sales-by-category', reportController.salesByCategory);
router.get('/monthly-revenue', reportController.monthlyRevenue);
router.get('/top-selling-books', reportController.topSellingBooks);
router.get('/customer-insights', reportController.customerInsights);
router.get('/inventory-status', reportController.inventoryStatus);

module.exports = router;