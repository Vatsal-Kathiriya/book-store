const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import database connection
const connectDB = require('../config/database');
const Book = require('../models/book.model');

// Connect to database
connectDB();

// Array to store all book data
const books = [];

// Read CSV file
fs.createReadStream(path.join(__dirname, '../../BooksDatasetClean.csv'))
  .pipe(csv())
  .on('data', (data) => {
    // Process each row
    const book = {
      title: data.title?.replace(/^"|"$/g, '') || 'Unknown Title',
      author: (data.author?.replace(/^By |"By |^"|"$/g, '') || 'Unknown Author').trim(),
      description: data.description || '',
      category: extractCategory(data.category || ''),
      price: parseFloat(data.price) || 9.99,
      publishedDate: data.publishedDate || '',
      publisher: data.publisher || 'Unknown Publisher',
      quantity: Math.floor(Math.random() * 50) + 1, // Random quantity between 1-50
      imageUrl: `/images/books/${Math.floor(Math.random() * 20) + 1}.jpg`, // Random image from 1-20
      format: randomFormat(),
      language: 'English',
      pages: Math.floor(Math.random() * 500) + 50, // Random pages between 50-550
      rating: (Math.random() * 5).toFixed(1), // Random rating between 0-5
      reviewCount: Math.floor(Math.random() * 100), // Random review count between 0-100
      featured: Math.random() > 0.9, // 10% chance of being featured
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0 // 30% chance of discount between 0-30%
    };
    
    books.push(book);
  })
  .on('end', async () => {
    try {
      // Clear existing books
      await Book.deleteMany({});
      console.log('Existing books removed');
      
      // Insert all books
      const result = await Book.insertMany(books);
      console.log(`${result.length} books successfully imported`);
      
      // Disconnect from database
      mongoose.disconnect();
    } catch (error) {
      console.error('Error importing books:', error);
      process.exit(1);
    }
  });

// Helper function to extract main category
function extractCategory(categoryString) {
  // If category is empty, return default
  if (!categoryString) return 'General';
  
  // Remove quotes and clean up
  const cleaned = categoryString.replace(/^"|"$/g, '').trim();
  
  // If it's still empty, return default
  if (!cleaned) return 'General';
  
  // Split by comma and take first category
  const categories = cleaned.split(',');
  
  // If there's a main category, use it
  if (categories[0].includes(' , ')) {
    return categories[0].split(' , ')[0].trim();
  }
  
  return categories[0].trim();
}

// Helper function to generate random book format
function randomFormat() {
  const formats = ['Hardcover', 'Paperback', 'E-Book', 'Audiobook'];
  return formats[Math.floor(Math.random() * formats.length)];
}