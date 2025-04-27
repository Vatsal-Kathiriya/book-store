"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiGrid, FiList, FiFilter, FiSearch, FiStar, FiX } from 'react-icons/fi';

// Define book type
interface Book {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  price: number;
  rating: number;
  category: string;
  publishYear?: number;
}

export default function BooksPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  // Sample books data - in a real app, this would come from an API
  const [books, setBooks] = useState<Book[]>([
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop',
      price: 12.99,
      rating: 4.8,
      category: 'fiction',
      publishYear: 1925
    },
    {
      id: '2',
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1776&auto=format&fit=crop',
      price: 15.99,
      rating: 4.7,
      category: 'non-fiction',
      publishYear: 2011
    },
    {
      id: '3',
      title: 'Dune',
      author: 'Frank Herbert',
      imageUrl: 'https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?q=80&w=1776&auto=format&fit=crop',
      price: 13.99,
      rating: 4.9,
      category: 'science-fiction',
      publishYear: 1965
    },
    {
      id: '4',
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      imageUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1974&auto=format&fit=crop',
      price: 11.99,
      rating: 4.6,
      category: 'mystery',
      publishYear: 2019
    },
    {
      id: '5',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1776&auto=format&fit=crop',
      price: 10.99,
      rating: 4.9,
      category: 'classic',
      publishYear: 1960
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(categoryParam || '');
  const [sortBy, setSortBy] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>(['All', 'fiction', 'non-fiction', 'science-fiction', 'mystery', 'classic']);

  useEffect(() => {
    // Fetch books and categories when component mounts
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setBooks(books);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setError('Failed to load books. Please try again later.');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setCategories(['All', 'fiction', 'non-fiction', 'science-fiction', 'mystery', 'classic']);
      }, 500);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Filter and sort books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === '' || category === 'All' || book.category === category;
    
    return matchesSearch && matchesCategory;
  });

  // Sort books based on selected option
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else {
      // Default: sort by title
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="container-page">
      <h1 className="text-3xl font-bold mb-8">Browse Books</h1>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or author..."
            className="form-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            className="form-input bg-white dark:bg-gray-800" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select 
            className="form-input bg-white dark:bg-gray-800" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort books by"
          >
            <option value="">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
          
          <div className="flex border border-gray-300 dark:border-gray-700 rounded-md">
            <button 
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button 
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Showing {sortedBooks.length} {sortedBooks.length === 1 ? 'result' : 'results'}
          </p>
          
          {/* Books Grid/List View */}
          {sortedBooks.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedBooks.map(book => (
                  <Link href={`/books/${book.id}`} key={book.id} className="card group">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img 
                        src={book.imageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop'} 
                        alt={book.title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-amber-400 text-black px-2 py-1 rounded-full text-sm font-medium flex items-center">
                        <FiStar className="mr-1" /> {book.rating}
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{book.category}</span>
                      <h3 className="font-bold text-lg mt-1 text-gray-900 dark:text-white text-ellipsis overflow-hidden">{book.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{book.author}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">${book.price.toFixed(2)}</span>
                        <button className="btn-primary text-sm py-1 text-white">Add to Cart</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {sortedBooks.map(book => (
                  <Link href={`/books/${book.id}`} key={book.id} className="card p-4 flex flex-col sm:flex-row gap-4 group">
                    <div className="w-full sm:w-28 h-40 relative flex-shrink-0">
                      <img 
                        src={book.imageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop'} 
                        alt={book.title}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{book.category}</span>
                          <h3 className="font-bold text-xl mt-1 text-gray-900 dark:text-white">{book.title}</h3>
                          <p className="text-gray-700 dark:text-gray-300">{book.author}</p>
                        </div>
                        <div className="bg-amber-400 text-black px-2 py-1 rounded-full text-sm font-medium flex items-center">
                          <FiStar className="mr-1" /> {book.rating}
                        </div>
                      </div>
                      <div className="mt-auto flex justify-between items-center pt-4">
                        <span className="font-bold text-xl text-gray-900 dark:text-gray-100">${book.price.toFixed(2)}</span>
                        <button className="btn-primary text-white">Add to Cart</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            // No results
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">No books found matching your criteria.</p>
              <button 
                className="btn-outline mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setCategory('');
                  setSortBy('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}