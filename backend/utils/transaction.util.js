const mongoose = require('mongoose');

/**
 * Execute a function within a MongoDB transaction
 * @param {Function} callback - Async function that accepts a session and executes transaction operations
 * @returns {Promise<any>} - Promise that resolves with the result of the callback
 */
const withTransaction = async (callback) => {
  // Start a MongoDB session
  const session = await mongoose.startSession();
  
  try {
    // Start a transaction
    session.startTransaction();
    
    // Execute the callback, passing in the session
    const result = await callback(session);
    
    // Commit the transaction
    await session.commitTransaction();
    
    // Return the result
    return result;
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    throw error; // Re-throw the error for the caller to handle
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * Execute a function within a MongoDB transaction with retry logic
 * @param {Function} callback - Async function that accepts a session and executes transaction operations
 * @param {Object} options - Retry options
 * @returns {Promise<any>} - Promise that resolves with the result of the callback
 */
const withTransactionRetry = async (callback, options = {}) => {
  const { maxRetries = 3, retryDelay = 500 } = options;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback);
    } catch (error) {
      lastError = error;
      
      // Only retry on transient errors (not validation or business logic errors)
      const isTransientError = error.name === 'MongoError' && 
        (error.code === 112 || // WriteConflict
         error.code === 251 || // TransactionTooLong
         error.errorLabels && error.errorLabels.includes('TransientTransactionError'));
      
      if (!isTransientError || attempt === maxRetries) {
        break; // Don't retry on non-transient errors or if max retries reached
      }
      
      console.log(`Transaction attempt ${attempt} failed with error: ${error.message}. Retrying...`);
      
      // Wait before retrying (with exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw lastError; // Re-throw the last error if all retries fail
};

module.exports = { withTransaction, withTransactionRetry };