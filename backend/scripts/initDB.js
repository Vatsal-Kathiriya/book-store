const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import models and database connection
const connectDB = require('../config/database');
const User = require('../models/user.model');
const Book = require('../models/book.model');

// Connect to database
connectDB();

// Sample admin user
const adminUser = {
  name: 'Vatsal Kathiriya',
  email: 'vatsalkathiriya2@gmail.com',
  password: 'admin123',
  role: 'admin'
};

// Initialize database
const initDB = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      const newAdmin = new User(adminUser);
      await newAdmin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create indexes
    console.log('Ensuring indexes...');
    await Book.createIndexes();
    await User.createIndexes();
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Run the initialization
initDB();