const Order = require('../models/order.model');
const Book = require('../models/book.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { withTransaction } = require('../utils/transaction.util');

/**
 * Create a new order with transaction support
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Order must contain at least one item' 
      });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    // Get user ID from authenticated request
    const userId = req.user._id;
    
    const result = await withTransaction(async (session) => {
      // Check if user exists
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Process items and check inventory
      let orderItems = [];
      let subTotal = 0;
      let shippingPrice = 0;
      let taxPrice = 0;
      
      // Calculate shipping cost and tax rate
      const shippingRate = 5; // $5 flat rate
      const taxRate = 0.08; // 8% tax
      
      // Process each order item
      for (const item of items) {
        const { bookId, quantity } = item;
        
        // Enhanced validation with more informative errors
        if (!bookId) {
          throw new Error('Book ID is required for all items');
        }
        
        // Better ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
          throw new Error(`Invalid book ID format: ${bookId}. Must be a valid MongoDB ObjectId.`);
        }
        
        // Validate item
        if (!quantity || quantity <= 0) {
          throw new Error('Quantity must be greater than 0');
        }
        
        // Find the book and update inventory in a single atomic operation
        const book = await Book.findOneAndUpdate(
          { 
            _id: bookId,
            quantity: { $gte: quantity } // Check if enough inventory
          },
          { 
            $inc: { quantity: -quantity } // Decrease inventory
          },
          { 
            new: true, // Return updated document
            session // Use the transaction session
          }
        );
        
        // If book not found or insufficient inventory, provide better errors
        if (!book) {
          const checkBook = await Book.findById(bookId).session(session);
          
          if (!checkBook) {
            // Log all books in the database to help diagnose the issue
            if (process.env.NODE_ENV === 'development') {
              const allBooks = await Book.find({}, '_id title').limit(10).lean().session(session);
              console.log(`Available books in DB: ${JSON.stringify(allBooks)}`);
            }
            throw new Error(`Book not found with ID: ${bookId}. Please check if the book exists in the database.`);
          }
          
          if (checkBook.quantity < quantity) {
            throw new Error(`Insufficient inventory for "${checkBook.title}". Available: ${checkBook.quantity}`);
          }
        }
        
        // Calculate item price with discount
        let discount = book.discount || 0;
        let finalPrice = book.price * (1 - discount / 100);
        let itemTotal = finalPrice * quantity;
        
        // Add to order items
        orderItems.push({
          book: book._id,
          quantity: quantity,
          price: book.price,
          discount: discount
        });
        
        // Add to subtotal
        subTotal += itemTotal;
      }
      
      // Calculate shipping and tax
      shippingPrice = items.length > 0 ? shippingRate : 0;
      taxPrice = subTotal * taxRate;
      
      // Calculate total
      const totalPrice = subTotal + shippingPrice + taxPrice;
      
      // Create the order
      const newOrder = new Order({
        user: userId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        shippingPrice,
        taxPrice,
        totalPrice,
        status: 'Pending'
      });
      
      // Save the order
      const savedOrder = await newOrder.save({ session });
      
      return {
        _id: savedOrder._id,
        totalPrice: savedOrder.totalPrice,
        status: savedOrder.status
      };
    });
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: result
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // More specific error status codes
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to create order';
    
    if (errorMessage.includes('not found') || errorMessage.includes('Book not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('Invalid book ID') || errorMessage.includes('required')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Cancel order with transaction
 */
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const result = await withTransaction(async (session) => {
      // Find the order and check if it can be cancelled
      const order = await Order.findById(orderId).session(session);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Only allow cancellation for Pending or Processing orders
      if (!['Pending', 'Processing'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}. Only Pending or Processing orders can be cancelled.`);
      }
      
      // Check if the user is the order owner or an admin
      if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
        throw new Error('Not authorized to cancel this order');
      }
      
      // Restore inventory for each item
      for (const item of order.items) {
        await Book.updateOne(
          { _id: item.book },
          { $inc: { quantity: item.quantity } }, // Increase inventory
          { session }
        );
      }
      
      // Update order status
      order.status = 'Cancelled';
      await order.save({ session });
      
      return {
        _id: order._id,
        status: order.status
      };
    });
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: result
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    
    // Determine appropriate status code based on error message
    let statusCode = 500;
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('Cannot cancel') || error.message.includes('Not authorized')) {
      statusCode = 400;
    } else if (error.message.includes('authorized')) {
      statusCode = 403;
    }
    
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get all orders for the current user
 */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.book', 'title author price imageUrl');
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    
    console.log(`Fetching order ${orderId} for user ${userId}`);
    
    // Find the order with populated book details
    const order = await Order.findById(orderId)
      .populate({
        path: 'items.book',
        select: 'title author price imageUrl'
      });
    
    if (!order) {
      console.log(`Order not found: ${orderId}`);
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    // Check if the user is authorized to view this order
    // Admin can view any order, regular users can only view their own orders
    if (req.user.role !== 'admin' && order.user.toString() !== userId.toString()) {
      console.log(`User ${userId} not authorized to view order ${orderId}`);
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }
    
    console.log(`Successfully fetched order ${orderId}`);
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get an admin order by ID 
 */
exports.getAdminOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Find the order with populated user and book details
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate({
        path: 'items.book',
        select: 'title author price imageUrl'
      });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching admin order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all orders (admin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.book', 'title author price');
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update order status (admin)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
