const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`Registration attempt for: ${email}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration failed: User ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user with hashed password
    const user = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: role || 'user'
    });
    
    await user.save();
    console.log(`User ${email} registered successfully`);
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-jwt-secret-for-development',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      user: {
        id: user._id.toString(), // Convert ObjectId to string explicitly
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User ${email} not found in database`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log(`User found: ${email}, comparing passwords...`);
    
    // Debug - checking stored password hash
    console.log(`Stored hashed password: ${user.password.substring(0, 10)}...`);
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password comparison result: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log(`Password match for ${email}, generating token`);
    
    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.warn('WARNING: JWT_SECRET not found in environment variables. Using fallback secret.');
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-jwt-secret-for-development',
      { expiresIn: '24h' }
    );
    
    console.log(`Login successful for ${email}`);
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Return user and token
    res.json({
      user: {
        id: user._id.toString(), // Convert ObjectId to string explicitly
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};