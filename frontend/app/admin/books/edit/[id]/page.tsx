"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FiSave, FiArrowLeft, FiUpload } from 'react-icons/fi';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  isbn: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  publishedDate: string;
}

export default function EditBook() {
  const { id } = useParams();
  const router = useRouter();
  
  const [book, setBook] = useState<Partial<Book>>({
    title: '',
    author: '',
    description: '',
    isbn: '',
    price: 0,
    quantity: 0,
    category: '',
    imageUrl: '',
    publishedDate: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Sample categories - In production, fetch from backend
  const categories = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Biography',
    'History',
    'Self-Help'
  ];

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // For production:
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`);
        // setBook(response.data);
        
        // For development:
        // Sample data
        setTimeout(() => {
          setBook({
            _id: id as string,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            description: 'A novel about the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
            isbn: '9780743273565',
            price: 12.99,
            quantity: 15,
            category: 'Fiction',
            imageUrl: 'https://source.unsplash.com/random/300x500/?book,gatsby',
            publishedDate: '1925-04-10',
          });
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details');
        setIsLoading(false);
      }
    };
    
    if (id !== 'new') {
      fetchBook();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'price' || name === 'quantity') {
      setBook({
        ...book,
        [name]: value === '' ? '' : Number(value),
      });
    } else {
      setBook({
        ...book,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (id === 'new') {
        // For production:
        // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/books`, book);
        
        // For development:
        console.log('Creating new book:', book);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Show success message
        setSuccessMessage('Book created successfully!');
      } else {
        // For production:
        // const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, book);
        
        // For development:
        console.log('Updating book:', book);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Show success message
        setSuccessMessage('Book updated successfully!');
      }
      
      // Redirect after a short delay so the user can see the success message
      setTimeout(() => {
        router.push('/admin/books');
      }, 2000);
    } catch (err) {
      console.error('Error saving book:', err);
      setError('Failed to save book. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin/books" 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Go back"
          >
            <FiArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {id === 'new' ? 'Add New Book' : 'Edit Book'}
          </h1>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={book.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter book title"
            />
          </div>
          
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={book.author}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter author name"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={book.category}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ISBN *
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={book.isbn}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter ISBN"
            />
          </div>
          
          <div>
            <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Publication Date
            </label>
            <input
              type="date"
              id="publishedDate"
              name="publishedDate"
              value={book.publishedDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={book.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="form-input"
              placeholder="Enter price"
            />
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity in Stock *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={book.quantity}
              onChange={handleChange}
              required
              min="0"
              step="1"
              className="form-input"
              placeholder="Enter quantity"
            />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <div className="flex">
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={book.imageUrl}
                onChange={handleChange}
                className="form-input rounded-r-none"
                placeholder="Enter image URL or upload"
              />
              <button
                type="button"
                aria-label="Upload image"
                className="px-4 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <FiUpload className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={book.description}
              onChange={handleChange}
              rows={5}
              className="form-input"
              placeholder="Enter book description"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end space-x-4">
          <Link
            href="/admin/books"
            className="btn btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary inline-flex items-center"
          >
            <FiSave className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Book'}
          </button>
        </div>
      </form>
    </div>
  );
}