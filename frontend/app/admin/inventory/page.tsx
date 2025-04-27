"use client";

import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiUpload, 
  FiDownload,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import axios from 'axios';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  quantity: number;
  threshold?: number;
  imageUrl?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

interface InventoryUpdateItem {
  bookId: string;
  quantity: number;
  operation: 'set' | 'increment';
}

export default function InventoryPage() {
  // State management
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    inStock: false,
    lowStock: false,
  });
  const [updateQuantity, setUpdateQuantity] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Fetch books data
  const fetchBooks = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Try to fetch from API - if it fails, use mock data
      try {
        const response = await axios.get('/api/books?limit=100');
        if (response.data.success) {
          setBooks(response.data.books);
          setFilteredBooks(response.data.books);
          
          // Initialize update quantities with current values
          const initialQuantities: Record<string, number> = {};
          response.data.books.forEach((book: Book) => {
            initialQuantities[book._id] = book.quantity;
          });
          setUpdateQuantity(initialQuantities);
        } else {
          throw new Error(response.data.message || 'Failed to fetch books');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        // If API call fails, use mock data
        const mockBooks = generateMockBooks();
        setBooks(mockBooks);
        setFilteredBooks(mockBooks);
        
        // Initialize update quantities with mock values
        const initialQuantities: Record<string, number> = {};
        mockBooks.forEach((book: Book) => {
          initialQuantities[book._id] = book.quantity;
        });
        setUpdateQuantity(initialQuantities);
      }
    } catch (err) {
      console.error('Error in fetchBooks:', err);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock book data for testing when API is not available
  const generateMockBooks = (): Book[] => {
    const categories = ['Fiction', 'Science Fiction', 'Mystery', 'Biography', 'History', 'Self-Help'];
    const mockBooks = [];
    
    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const quantity = Math.floor(Math.random() * 50);
      
      mockBooks.push({
        _id: `mock-book-${i}`,
        title: `Book Title ${i}`,
        author: `Author ${i}`,
        isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        category,
        price: parseFloat((9.99 + Math.random() * 20).toFixed(2)),
        quantity,
        threshold: 5,
        imageUrl: `/images/books/${(i % 20) + 1}.jpg`,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return mockBooks;
  };

  // Fetch on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...books];
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(searchLower) || 
        book.author.toLowerCase().includes(searchLower) || 
        book.isbn.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(book => book.category === filters.category);
    }
    
    // Apply stock filters
    if (filters.inStock) {
      result = result.filter(book => book.quantity > 0);
    }
    
    if (filters.lowStock) {
      result = result.filter(book => {
        const threshold = book.threshold || 5; // Default threshold if not specified
        return book.quantity > 0 && book.quantity <= threshold;
      });
    }
    
    setFilteredBooks(result);
  }, [books, search, filters]);

  // Handle quantity update
  const handleQuantityChange = (bookId: string, value: string) => {
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setUpdateQuantity(prev => ({
        ...prev,
        [bookId]: parsedValue
      }));
    }
  };

  // Increment/decrement quantity
  const adjustQuantity = (bookId: string, adjustment: number) => {
    setUpdateQuantity(prev => {
      const currentValue = prev[bookId] || 0;
      const newValue = Math.max(0, currentValue + adjustment); // Ensure quantity doesn't go below 0
      return {
        ...prev,
        [bookId]: newValue
      };
    });
  };

  // Save inventory updates
  const saveInventoryUpdates = async () => {
    setIsUpdating(true);
    setError('');
    setUpdateSuccess(null);
    
    try {
      // Prepare update data - only include books where quantity has changed
      const updates: InventoryUpdateItem[] = [];
      
      books.forEach(book => {
        const originalQuantity = book.quantity;
        const newQuantity = updateQuantity[book._id];
        
        if (newQuantity !== undefined && newQuantity !== originalQuantity) {
          updates.push({
            bookId: book._id,
            quantity: newQuantity,
            operation: 'set'
          });
        }
      });
      
      if (updates.length === 0) {
        setUpdateSuccess('No changes to save');
        setIsUpdating(false);
        return;
      }
      
      // Try to call API - if it fails, simulate success for testing
      try {
        const response = await axios.post('/api/admin/inventory/update', { updates });
        
        if (response.data.success) {
          await fetchBooks();
          setUpdateSuccess(`Successfully updated ${updates.length} item${updates.length > 1 ? 's' : ''}`);
        } else {
          throw new Error(response.data.message || 'Failed to update inventory');
        }
      } catch (apiError) {
        console.error('API Error in saveInventoryUpdates:', apiError);
        
        // For testing without API: Update local state to simulate successful update
        const updatedBooks = books.map(book => {
          if (updates.some(update => update.bookId === book._id)) {
            return {
              ...book,
              quantity: updateQuantity[book._id]
            };
          }
          return book;
        });
        
        setBooks(updatedBooks);
        applyFiltersToBooks(updatedBooks);
        setUpdateSuccess(`Successfully updated ${updates.length} item${updates.length > 1 ? 's' : ''} (mock update)`);
      }
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError('Failed to update inventory. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Apply filters to a specific set of books
  const applyFiltersToBooks = (booksToFilter: Book[]) => {
    let result = [...booksToFilter];
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(searchLower) || 
        book.author.toLowerCase().includes(searchLower) || 
        book.isbn.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(book => book.category === filters.category);
    }
    
    // Apply stock filters
    if (filters.inStock) {
      result = result.filter(book => book.quantity > 0);
    }
    
    if (filters.lowStock) {
      result = result.filter(book => {
        const threshold = book.threshold || 5; // Default threshold if not specified
        return book.quantity > 0 && book.quantity <= threshold;
      });
    }
    
    setFilteredBooks(result);
  };

  // Apply filters to current books
  useEffect(() => {
    if (books.length > 0) {
      applyFiltersToBooks(books);
    }
  }, [books, search, filters]);

  // Get unique categories for filter dropdown
  const categories = [...new Set(books.map(book => book.category))].sort();

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setFilters({
      category: '',
      inStock: false,
      lowStock: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your book inventory, update quantities, and monitor stock levels
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/books/new" className="btn btn-primary inline-flex items-center">
            <FiPlus className="mr-2" /> Add Book
          </Link>
          <button
            onClick={saveInventoryUpdates}
            disabled={isUpdating}
            className="btn btn-outline inline-flex items-center"
          >
            {isUpdating ? (
              <><LoadingSpinner size="sm" className="mr-2" /> Saving...</>
            ) : (
              <><FiCheck className="mr-2" /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
          <p className="flex items-center"><FiAlertCircle className="mr-2" /> {error}</p>
        </div>
      )}
      
      {updateSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-lg">
          <p className="flex items-center"><FiCheck className="mr-2" /> {updateSuccess}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by title, author or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline inline-flex items-center min-w-[100px]"
              >
                <FiFilter className="mr-2" /> Filter
              </button>
              
              <button
                onClick={fetchBooks}
                className="btn btn-outline inline-flex items-center"
                disabled={isLoading}
              >
                <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white p-2"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="ml-2 text-sm text-gray-700 dark:text-gray-300">In Stock Only</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lowStock"
                    checked={filters.lowStock}
                    onChange={(e) => setFilters({...filters, lowStock: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="lowStock" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Low Stock Items</label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-outline btn-sm"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Inventory Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">No books found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBooks.map((book) => {
                  const isLowStock = book.threshold 
                    ? book.quantity <= book.threshold 
                    : book.quantity <= 5;
                  const isOutOfStock = book.quantity === 0;
                  
                  return (
                    <tr key={book._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {book.imageUrl ? (
                            <img 
                              src={book.imageUrl} 
                              alt={book.title} 
                              className="h-10 w-10 object-cover rounded mr-3" 
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mr-3">
                              <FiBook className="text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{book.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ${book.price.toFixed(2)}
                          {book.discount && book.discount > 0 && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                              {book.discount}% off
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => adjustQuantity(book._id, -1)}
                            className="h-8 w-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            disabled={updateQuantity[book._id] <= 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={updateQuantity[book._id] || 0}
                            onChange={(e) => handleQuantityChange(book._id, e.target.value)}
                            className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white py-1"
                          />
                          <button
                            onClick={() => adjustQuantity(book._id, 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/admin/books/edit/${book._id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                        >
                          <FiEdit className="inline" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Table Footer with count */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>
    </div>
  );
}
