const User = require('../models/user.model');
const Transaction = require('../models/transaction.model'); // We'll create this next
const { withTransaction } = require('../utils/transaction.util');

/**
 * Add funds to user wallet
 */
exports.addFunds = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    const result = await withTransaction(async (session) => {
      // Find user
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user balance
      user.balance += amount;
      await user.save({ session });
      
      // Create transaction record
      const transaction = new Transaction({
        user: userId,
        type: 'DEPOSIT',
        amount,
        description: 'Funds added to wallet',
        status: 'COMPLETED',
      });
      
      await transaction.save({ session });
      
      return {
        balance: user.balance,
        transaction: transaction._id
      };
    });
    
    res.json({
      success: true,
      message: 'Funds added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to add funds',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Pay for order using wallet balance
 */
exports.payForOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.body;
    
    const result = await withTransaction(async (session) => {
      // Find user
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Find order
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if order belongs to user
      if (order.user.toString() !== userId.toString()) {
        throw new Error('Not authorized to pay for this order');
      }
      
      // Check if order is already paid
      if (order.isPaid) {
        throw new Error('Order is already paid');
      }
      
      // Check if user has enough balance
      if (user.balance < order.totalPrice) {
        throw new Error('Insufficient funds in wallet');
      }
      
      // Update user balance
      user.balance -= order.totalPrice;
      await user.save({ session });
      
      // Update order
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      await order.save({ session });
      
      // Create transaction record
      const transaction = new Transaction({
        user: userId,
        type: 'PAYMENT',
        amount: order.totalPrice,
        description: `Payment for order #${order._id}`,
        status: 'COMPLETED',
        order: orderId
      });
      
      await transaction.save({ session });
      
      return {
        balance: user.balance,
        orderId: order._id,
        transaction: transaction._id
      };
    });
    
    res.json({
      success: true,
      message: 'Payment successful',
      data: result
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    
    let statusCode = 500;
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('Insufficient funds') || error.message.includes('already paid')) {
      statusCode = 400;
    } else if (error.message.includes('Not authorized')) {
      statusCode = 403;
    }
    
    res.status(statusCode).json({ 
      success: false,
      message: error.message || 'Failed to process payment',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};