const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const orderService = require('../services/orderService');
const logger = require('../utils/logger');

// ...existing controller functions...

// @desc    Get all orders with filtering and pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    // ...existing code...
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    // Log the incoming request
    logger.info(`Request to update order ${orderId} status to ${status}`);

    if (!status) {
        res.status(400);
        throw new Error('Status is required');
    }

    // Basic validation for allowed statuses - make case insensitive comparison
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    if (!allowedStatuses.includes(normalizedStatus)) {
        logger.warn(`Invalid status attempt: ${status} for order ${orderId}`);
        res.status(400);
        throw new Error(`Invalid status: ${status}. Valid statuses are: ${allowedStatuses.join(', ')}`);
    }

    try {
        // Pass the normalized status to ensure consistent casing
        const updatedOrder = await orderService.updateOrderStatus(orderId, normalizedStatus);
        
        if (!updatedOrder) {
            res.status(404);
            throw new Error('Order not found');
        }
        
        logger.info(`Order ${orderId} status updated to ${normalizedStatus} by admin ${req.user.id}`);
        
        // Return success response with updated order
        return res.json({
            success: true,
            message: `Order status updated to ${normalizedStatus}`,
            order: updatedOrder
        });
    } catch (error) {
        logger.error(`Error updating order status for order ${orderId}: ${error.message}`);
        
        // Check if error is a MongoDB related error
        if (error.name === 'CastError') {
            res.status(400);
            return res.json({
                success: false, 
                message: `Invalid order ID format: ${orderId}`
            });
        }
        
        // Check if this is a "not found" error
        if (error.message.includes('not found')) {
            res.status(404);
            return res.json({
                success: false, 
                message: `Order with ID ${orderId} not found`
            });
        }
        
        // Generic server error
        res.status(500);
        return res.json({
            success: false,
            message: `Failed to update order status: ${error.message}`
        });
    }
});


module.exports = {
    // ...existing exports...
    getOrders,
    updateOrderStatus,
};