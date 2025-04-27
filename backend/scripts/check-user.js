/**
 * Script to check if a user exists in the database
 * Usage: node scripts/check-user.js <email>
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Validate arguments
if (process.argv.length < 3) {
  console.error('Please provide an email address');
  console.error('Usage: node scripts/check-user.js <email>');
  process.exit(1);
}

const email = process.argv[2];
const testPassword = process.argv[3];

async function checkUser() {
  let connection = null;
  try {
    // Connect to the database
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found in the database`);
      return;
    }
    
    console.log('\nUser found:');
    console.log('---------------------------');
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.name || 'NOT SET'}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role || 'NOT SET'}`);
    console.log(`Created at: ${user.createdAt}`);
    console.log(`Last login: ${user.lastLogin || 'Never'}`);
    
    // Check if all required profile fields exist
    const requiredFields = ['name', 'email', 'role'];
    const missingFields = requiredFields.filter(field => !user[field]);
    
    if (missingFields.length > 0) {
      console.log('\n⚠️ Profile Issue Detected:');
      console.log(`Missing required fields: ${missingFields.join(', ')}`);
      console.log('This may cause the profile not to display correctly');
    } else {
      console.log('\n✅ Profile data looks complete');
    }
    
    console.log('\nAll User Data:');
    console.log('---------------------------');
    const userData = user.toObject();
    delete userData.password; // Don't show full password hash
    console.log(JSON.stringify(userData, null, 2));
    
    // Check password if provided
    if (testPassword) {
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`\nPassword verification: ${isMatch ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.name === 'MongoServerError') {
      console.error('\nDatabase connection issue detected. Please check:');
      console.error('1. MongoDB is running');
      console.error('2. MONGODB_URI in .env file is correct');
      console.error(`3. Network connectivity to MongoDB server`);
    }
  } finally {
    if (connection) {
      mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

checkUser();
