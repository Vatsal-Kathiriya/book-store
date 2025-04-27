const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Calculate price after discount
orderItemSchema.virtual('finalPrice').get(function() {
  return this.price * this.quantity * (1 - this.discount / 100);
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'USA' },
  phone: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
    required: true
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    updateTime: { type: String },
    email: { type: String }
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  trackingNumber: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Virtual for items count
orderSchema.virtual('itemsCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Pre-save hook to calculate total price
orderSchema.pre('save', function(next) {
  // Calculate items total
  const itemsTotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity * (1 - item.discount / 100));
  }, 0);
  
  // Calculate final total
  this.totalPrice = itemsTotal + this.shippingPrice + this.taxPrice;
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;