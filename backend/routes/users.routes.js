const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
// None for users API - all should require authentication

// User profile routes (requires authentication)
router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);
router.put('/change-password', authenticate, userController.changePassword);

// Admin-only routes
router.get('/', authenticate, requireAdmin, userController.getAllUsers);
router.get('/:id', authenticate, requireAdmin, userController.getUserById);
router.post('/', authenticate, requireAdmin, userController.createUser);
router.put('/:id', authenticate, requireAdmin, userController.updateUser);
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

module.exports = router;