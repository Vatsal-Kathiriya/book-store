const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ order: 1 }, { sparse: true });
transactionSchema.index({ status: 1, type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;