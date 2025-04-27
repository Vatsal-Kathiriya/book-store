const Order = require('../models/Order');
const Book = require('../models/Book');
const { generateOrderId } = require('../utils/orderUtils');
const logger = require('../utils/logger');

// ...existing service functions...

/**
 * Update the status of a specific order.
 * @param {string} orderId - The ID of the order to update.
 * @param {string} status - The new status.
 * @returns {Promise<Order>} The updated order document.
 * @throws {Error} If the order is not found or update fails.
 */
const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error('Order not found');
    }

    // Store previous status for logging
    const previousStatus = order.status;
    
    order.status = status;
    
    // Special case for Delivered status
    if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }
    
    // Special case for Cancelled status - could add inventory restoration logic here
    if (status === 'Cancelled') {
        // Optional: Add logic to restore inventory
    }

    try {
        const updatedOrder = await order.save();
        logger.info(`Order status updated successfully for order ${orderId} from ${previousStatus} to ${status}`);
        return updatedOrder;
    } catch (err) {
        logger.error(`Failed to save order ${orderId} with new status ${status}: ${err.message}`);
        throw new Error(`Database error while updating order: ${err.message}`);
    }
};

// Make sure all functions are properly defined and exported
module.exports = {
    // Ensure these functions are defined above or use placeholders
    createOrder: createOrder || (async () => {}),
    getOrderById: getOrderById || (async () => {}),
    getUserOrders: getUserOrders || (async () => {}),
    getAllOrdersAdmin: getAllOrdersAdmin || (async () => {}),
    updateOrderStatus
};
