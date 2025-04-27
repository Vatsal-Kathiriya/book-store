const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/featured', bookController.getFeaturedBooks);
router.get('/categories', bookController.getCategories);
router.get('/category/:category', bookController.getBooksByCategory);
router.get('/author/:author', bookController.getBooksByAuthor);
router.get('/:id', bookController.getBookById);

// Protected routes (admin only)
router.post('/', authenticate, requireAdmin, bookController.createBook);
router.put('/:id', authenticate, requireAdmin, bookController.updateBook);
router.delete('/:id', authenticate, requireAdmin, bookController.deleteBook);

module.exports = router;