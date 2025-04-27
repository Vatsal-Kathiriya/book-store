const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/database');
const Book = require('../models/book.model');
const { withTransaction } = require('../utils/transaction.util');

// New category mapping
const categoryMapping = {
  'Science Fiction': 'Sci-Fi & Fantasy',
  'Science': 'Science & Nature',
  'Fiction': 'Literature & Fiction',
  'Fantasy': 'Sci-Fi & Fantasy',
  'Mystery': 'Mystery & Thriller',
  'Self Help': 'Self-Development',
  // Add more mappings as needed
};

const migrateCategories = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Starting category migration...');
    
    await withTransaction(async (session) => {
      // Get all books that need category updates
      const books = await Book.find({
        category: { $in: Object.keys(categoryMapping) }
      }).session(session);
      
      console.log(`Found ${books.length} books to update`);
      
      // Track changes for reporting
      const changes = {};
      
      // Update each book's category
      for (const book of books) {
        const oldCategory = book.category;
        const newCategory = categoryMapping[oldCategory];
        
        if (newCategory) {
          book.category = newCategory;
          await book.save({ session });
          
          // Track changes
          if (!changes[oldCategory]) {
            changes[oldCategory] = { count: 0, newCategory };
          }
          changes[oldCategory].count++;
        }
      }
      
      // Report results
      console.log('Migration completed successfully!');
      console.log('Category changes:');
      Object.entries(changes).forEach(([oldCat, info]) => {
        console.log(`- ${oldCat} → ${info.newCategory} (${info.count} books)`);
      });
      
      return changes;
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
  }
};

// Run the migration
migrateCategories();