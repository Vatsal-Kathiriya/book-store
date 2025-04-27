const Book = require('../models/book.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Generate sales by category report
 */
exports.salesByCategory = async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate } = req.query;
    
    // Build date filter if provided
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Aggregation pipeline for sales by category
    const result = await Order.aggregate([
      // Match orders in the date range if specified
      { $match: dateFilter },
      
      // Unwind the items array to work with individual items
      { $unwind: "$items" },
      
      // Lookup to get book details for each item
      {
        $lookup: {
          from: "books",
          localField: "items.book",
          foreignField: "_id",
          as: "bookDetails"
        }
      },
      
      // Unwind the bookDetails array
      { $unwind: "$bookDetails" },
      
      // Group by book category and calculate total sales
      {
        $group: {
          _id: "$bookDetails.category",
          totalSales: { 
            $sum: { 
              $multiply: [
                "$items.price", 
                "$items.quantity",
                { $subtract: [1, { $divide: ["$items.discount", 100] }] }
              ]
            }
          },
          totalQuantity: { $sum: "$items.quantity" },
          averagePrice: { $avg: "$items.price" },
          count: { $sum: 1 }
        }
      },
      
      // Sort by total sales in descending order
      { $sort: { totalSales: -1 } },
      
      // Project to format the output
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalSales: { $round: ["$totalSales", 2] },
          totalQuantity: 1,
          averagePrice: { $round: ["$averagePrice", 2] },
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating sales by category report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate report', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Generate monthly revenue report
 */
exports.monthlyRevenue = async (req, res) => {
  try {
    // Extract parameters
    const { year } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();
    
    // Aggregation pipeline for monthly revenue
    const result = await Order.aggregate([
      // Match orders for the specified year
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
          }
        }
      },
      
      // Group by month and calculate revenue
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
          itemsSold: { 
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] }
              }
            }
          }
        }
      },
      
      // Sort by month
      { $sort: { _id: 1 } },
      
      // Project to format the output
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: { $round: ["$revenue", 2] },
          orders: 1,
          itemsSold: 1,
          monthName: {
            $let: {
              vars: {
                monthsArray: [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ]
              },
              in: { $arrayElemAt: ["$$monthsArray", { $subtract: ["$_id", 1] }] }
            }
          }
        }
      }
    ]);
    
    // Fill in missing months with zero values
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const filledResult = months.map(month => {
      const existingMonth = result.find(item => item.month === month);
      if (existingMonth) return existingMonth;
      
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      return {
        month,
        monthName: monthNames[month - 1],
        revenue: 0,
        orders: 0,
        itemsSold: 0
      };
    });

    res.json({
      success: true,
      year: currentYear,
      data: filledResult
    });
  } catch (error) {
    console.error('Error generating monthly revenue report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate monthly revenue report', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Generate top selling books report
 */
exports.topSellingBooks = async (req, res) => {
  try {
    // Extract query parameters
    const { limit = 10, period } = req.query;
    
    // Build date filter based on period
    const dateFilter = {};
    if (period) {
      dateFilter.createdAt = {};
      const now = new Date();
      
      switch (period) {
        case 'week':
          // Last 7 days
          dateFilter.createdAt.$gte = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          // Last 30 days
          dateFilter.createdAt.$gte = new Date(now.setDate(now.getDate() - 30));
          break;
        case 'quarter':
          // Last 90 days
          dateFilter.createdAt.$gte = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'year':
          // Last 365 days
          dateFilter.createdAt.$gte = new Date(now.setDate(now.getDate() - 365));
          break;
      }
    }

    // Aggregation pipeline
    const result = await Order.aggregate([
      // Match orders in the date range if specified
      { $match: dateFilter },
      
      // Unwind the items array
      { $unwind: "$items" },
      
      // Group by book ID and sum quantities
      {
        $group: {
          _id: "$items.book",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { 
            $sum: { 
              $multiply: [
                "$items.price", 
                "$items.quantity",
                { $subtract: [1, { $divide: ["$items.discount", 100] }] }
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      
      // Sort by totalQuantitySold in descending order
      { $sort: { totalQuantitySold: -1 } },
      
      // Limit results
      { $limit: parseInt(limit) },
      
      // Lookup to get book details
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails"
        }
      },
      
      // Unwind the bookDetails array
      { $unwind: "$bookDetails" },
      
      // Project to format the output
      {
        $project: {
          _id: 0,
          bookId: "$_id",
          title: "$bookDetails.title",
          author: "$bookDetails.author",
          category: "$bookDetails.category",
          price: "$bookDetails.price",
          totalQuantitySold: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          averagePrice: { 
            $round: [{ $divide: ["$totalRevenue", "$totalQuantitySold"] }, 2] 
          }
        }
      }
    ]);

    res.json({
      success: true,
      period: period || 'all time',
      data: result
    });
  } catch (error) {
    console.error('Error generating top selling books report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate top selling books report', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Generate customer insights report
 */
exports.customerInsights = async (req, res) => {
  try {
    const result = await Order.aggregate([
      // Lookup to get user details
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      
      // Unwind the userDetails array
      { $unwind: "$userDetails" },
      
      // Group by user
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalPrice" },
          firstPurchase: { $min: "$createdAt" },
          lastPurchase: { $max: "$createdAt" },
          userName: { $first: "$userDetails.name" },
          userEmail: { $first: "$userDetails.email" }
        }
      },
      
      // Sort by total spent in descending order
      { $sort: { totalSpent: -1 } },
      
      // Limit to top 100 customers
      { $limit: 100 },
      
      // Project to format the output
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userName",
          email: "$userEmail",
          totalSpent: { $round: ["$totalSpent", 2] },
          orderCount: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
          daysSinceLastPurchase: { 
            $round: [{ 
              $divide: [
                { $subtract: [new Date(), "$lastPurchase"] }, 
                1000 * 60 * 60 * 24
              ] 
            }, 0]
          },
          firstPurchase: 1,
          lastPurchase: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating customer insights report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate customer insights report', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Generate inventory status report
 */
exports.inventoryStatus = async (req, res) => {
  try {
    const result = await Book.aggregate([
      // Group by category
      {
        $group: {
          _id: "$category",
          totalBooks: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          averagePrice: { $avg: "$price" },
          lowStockCount: { 
            $sum: { $cond: [{ $lt: ["$quantity", 5] }, 1, 0] } 
          },
          outOfStockCount: { 
            $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] } 
          },
          highestPrice: { $max: "$price" },
          lowestPrice: { $min: "$price" }
        }
      },
      
      // Sort by total books in descending order
      { $sort: { totalBooks: -1 } },
      
      // Project to format the output
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalBooks: 1,
          totalQuantity: 1,
          averagePrice: { $round: ["$averagePrice", 2] },
          lowStockCount: 1,
          outOfStockCount: 1,
          inStockPercentage: { 
            $round: [
              { 
                $multiply: [
                  { 
                    $divide: [
                      { $subtract: ["$totalBooks", "$outOfStockCount"] }, 
                      "$totalBooks"
                    ] 
                  }, 
                  100
                ] 
              }, 
              1
            ] 
          },
          priceRange: { 
            $concat: [
              { $toString: { $round: ["$lowestPrice", 2] } }, 
              " - ", 
              { $toString: { $round: ["$highestPrice", 2] } }
            ] 
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: result,
      summary: {
        totalCategories: result.length,
        totalUniqueBooks: result.reduce((acc, curr) => acc + curr.totalBooks, 0),
        totalInventoryItems: result.reduce((acc, curr) => acc + curr.totalQuantity, 0),
        totalLowStock: result.reduce((acc, curr) => acc + curr.lowStockCount, 0),
        totalOutOfStock: result.reduce((acc, curr) => acc + curr.outOfStockCount, 0)
      }
    });
  } catch (error) {
    console.error('Error generating inventory status report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate inventory status report', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};