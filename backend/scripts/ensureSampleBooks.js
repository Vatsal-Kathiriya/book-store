const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/database');
const Book = require('../models/book.model');

// Sample books that should be available in the system
const sampleBooks = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A classic novel about racism and injustice in the American South.',
    category: 'Fiction',
    price: 12.99,
    quantity: 50,
    featured: true,
    rating: 4.8,
    publisher: 'HarperCollins',
    language: 'English',
    pages: 336,
    format: 'Paperback',
    isbn: '9780061120084',
    imageUrl: '/images/books/1.jpg'
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: 'A survey of the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century.',
    category: 'Non-Fiction',
    price: 15.99,
    quantity: 30,
    featured: true,
    rating: 4.7,
    publisher: 'Harper',
    language: 'English',
    pages: 464,
    format: 'Paperback',
    isbn: '9780062316110',
    imageUrl: '/images/books/2.jpg'
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A novel of the Jazz Age that depicts the empty lives of wealthy New Yorkers.',
    category: 'Fiction',
    price: 10.99,
    quantity: 45,
    featured: true,
    rating: 4.5,
    publisher: 'Scribner',
    language: 'English',
    pages: 180,
    format: 'Paperback',
    isbn: '9780743273565',
    imageUrl: '/images/books/3.jpg'
  }
];

async function ensureSampleBooks() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if books exist by ISBN, create if not
    const bookResults = [];
    
    for (const sampleBook of sampleBooks) {
      // Check if book exists by ISBN
      let book = await Book.findOne({ isbn: sampleBook.isbn });
      
      if (!book) {
        console.log(`Creating book: ${sampleBook.title}`);
        book = new Book(sampleBook);
        await book.save();
        bookResults.push({ title: sampleBook.title, _id: book._id, status: 'created' });
      } else {
        console.log(`Book already exists: ${sampleBook.title} (ID: ${book._id})`);
        bookResults.push({ title: sampleBook.title, _id: book._id, status: 'exists' });
      }
    }
    
    console.log('Sample books ensured in database:');
    console.log(JSON.stringify(bookResults, null, 2));
    
    // Print ID mapping for frontend integration
    console.log('\nBook ID mapping for frontend:');
    const mapping = {};
    bookResults.forEach((book, index) => {
      mapping[(index + 1).toString()] = book._id.toString();
    });
    console.log(JSON.stringify(mapping, null, 2));

  } catch (error) {
    console.error('Error ensuring sample books:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

// Run the function
ensureSampleBooks();
