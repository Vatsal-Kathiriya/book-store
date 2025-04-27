const mongoose = require('mongoose');
const Book = require('../models/book.model');

// Get all books with advanced filtering, sorting and pagination
exports.getAllBooks = async (req, res) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock
    } = req.query;
    
    // Build query
    const query = {};
    
    // Text search (if provided)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter (if provided)
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Author filter (if provided)
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }
    
    // Price range filter (if provided)
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }
    
    // In stock filter (if provided)
    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
    }
    
    // Calculate pagination values
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Determine sort direction
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination and sorting
    const books = await Book.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNumber)
      .lean(); // Use lean() for better performance when you don't need Mongoose document methods
    
    // Count total documents for pagination info
    const total = await Book.countDocuments(query);
    
    // Send response
    res.json({
      data: books,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      message: 'Failed to fetch books',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format'
      });
    }
    
    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(400).json({
      message: 'Failed to create book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(400).json({
      message: 'Failed to update book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      message: 'Failed to delete book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get featured books
exports.getFeaturedBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const featuredBooks = await Book.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    res.json(featuredBooks);
  } catch (error) {
    console.error('Error fetching featured books:', error);
    res.status(500).json({
      message: 'Failed to fetch featured books',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get books by category
exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const books = await Book.find({ category: { $regex: category, $options: 'i' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).json({
      message: 'Failed to fetch books by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get books by author
exports.getBooksByAuthor = async (req, res) => {
  try {
    const { author } = req.params;
    
    const books = await Book.find({ author: { $regex: author, $options: 'i' } })
      .lean();
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({
      message: 'Failed to fetch books by author',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all book categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Book.aggregate([
      { $group: { _id: '$category' } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(categories.map(cat => cat._id));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};