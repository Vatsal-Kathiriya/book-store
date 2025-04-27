const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true // Index for faster search
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true // Index for faster search
  },
  description: {
    type: String,
    trim: true
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allow null/undefined values
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    default: '/images/default-book.jpg'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true // Index for faster filtering
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  publishedDate: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'E-Book', 'Audiobook'],
    default: 'Paperback'
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for advanced filtering
bookSchema.index({ category: 1, author: 1 });

// Virtual for discounted price
bookSchema.virtual('discountedPrice').get(function() {
  return this.price * (1 - this.discount / 100);
});

// Method to check if book is in stock
bookSchema.methods.isInStock = function() {
  return this.quantity > 0;
};

// Static method to find featured books
bookSchema.statics.findFeatured = function() {
  return this.find({ featured: true });
};

// Pre-save hook
bookSchema.pre('save', function(next) {
  // Capitalize first letter of title
  if (this.title) {
    this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
  }
  
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;