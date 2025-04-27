const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found or token is invalid' });
    }
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Admin authorization middleware
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

// Specific permission check middleware (for more granular control)
exports.checkPermission = (permissionRequired) => {
  return (req, res, next) => {
    // You could implement a more complex permission system here
    // For now we'll just check the role
    if (req.user.role !== 'admin' && permissionRequired === 'manage-users') {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    
    next();
  };
};