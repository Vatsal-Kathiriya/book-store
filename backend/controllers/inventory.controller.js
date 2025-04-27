const Book = require('../models/book.model');
const { withTransaction } = require('../utils/transaction.util');

/**
 * Bulk update inventory levels
 */
exports.bulkUpdateInventory = async (req, res) => {
  try {
    const { updates } = req.body;
    
    // Validate request
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }
    
    const result = await withTransaction(async (session) => {
      const results = [];
      
      // Process each update in sequence
      for (const update of updates) {
        const { bookId, quantity, operation } = update;
        
        if (!bookId || quantity === undefined || !operation) {
          throw new Error(`Invalid update parameters: ${JSON.stringify(update)}`);
        }
        
        let book;
        
        // Perform the update based on operation type
        switch (operation) {
          case 'set':
            if (quantity < 0) {
              throw new Error(`Cannot set negative quantity for book ${bookId}`);
            }
            
            book = await Book.findByIdAndUpdate(
              bookId,
              { quantity },
              { new: true, session }
            );
            break;
            
          case 'increment':
            book = await Book.findByIdAndUpdate(
              bookId,
              { $inc: { quantity } },
              { new: true, session }
            );
            
            // Check if quantity went negative
            if (book && book.quantity < 0) {
              throw new Error(`Operation would result in negative inventory for "${book.title}"`);
            }
            break;
            
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
        
        if (!book) {
          throw new Error(`Book not found: ${bookId}`);
        }
        
        results.push({
          bookId,
          title: book.title,
          newQuantity: book.quantity
        });
      }
      
      return results;
    });
    
    res.json({
      success: true,
      message: 'Inventory updated successfully',
      updates: result
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    
    res.status(error.message.includes('not found') ? 404 : 400).json({ 
      success: false,
      message: error.message || 'Failed to update inventory',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Import inventory from CSV
 */
exports.importInventory = async (req, res) => {
  try {
    const { books } = req.body;
    
    // Validate request
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: 'No books provided for import' });
    }
    
    const result = await withTransaction(async (session) => {
      const stats = {
        created: 0,
        updated: 0,
        failed: 0,
        details: []
      };
      
      for (const bookData of books) {
        try {
          const { isbn, title, author, quantity, ...otherData } = bookData;
          
          // Check required fields
          if (!isbn || !title || !author || quantity === undefined) {
            throw new Error('Missing required fields');
          }
          
          // Try to find existing book by ISBN
          let book = await Book.findOne({ isbn }).session(session);
          
          if (book) {
            // Update existing book
            book.quantity = quantity;
            Object.assign(book, otherData); // Apply other updates
            await book.save({ session });
            stats.updated++;
            stats.details.push({ isbn, status: 'updated', title });
          } else {
            // Create new book
            book = new Book({
              isbn,
              title,
              author,
              quantity,
              ...otherData
            });
            await book.save({ session });
            stats.created++;
            stats.details.push({ isbn, status: 'created', title });
          }
        } catch (bookError) {
          stats.failed++;
          stats.details.push({ 
            isbn: bookData.isbn || 'unknown', 
            status: 'failed',
            error: bookError.message,
            title: bookData.title || 'unknown'
          });
        }
      }
      
      return stats;
    });
    
    res.json({
      success: true,
      message: 'Inventory import complete',
      stats: result
    });
  } catch (error) {
    console.error('Error importing inventory:', error);
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to import inventory',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};