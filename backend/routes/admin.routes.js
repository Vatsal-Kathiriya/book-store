const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const bookController = require('../controllers/book.controller');
const orderController = require('../controllers/order.controller');
const adminController = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Book management routes
router.get('/books', bookController.getAllBooks);
router.post('/books', bookController.createBook);
router.get('/books/:id', bookController.getBookById);
router.put('/books/:id', bookController.updateBook);
router.delete('/books/:id', bookController.deleteBook);

// Order management routes
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats); // Use the controller function

module.exports = router;