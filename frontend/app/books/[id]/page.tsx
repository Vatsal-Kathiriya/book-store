"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiShare2, FiPlus, FiMinus, FiStar } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  price: number;
  rating: number;
  category: string;
  quantity: number;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  language?: string;
  pages?: number;
}

export default function BookDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        
        // Try API call first
        try {
          const response = await fetch(`/api/books/${id}`);
          if (response.ok) {
            const data = await response.json();
            setBook(data.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API call failed, using fallback data');
        }
        
        // Fallback to sample data if API call fails
        setTimeout(() => {
          const sampleBook: Book = {
            id,
            title: id === '1' ? 'The Great Gatsby' : 
                  id === '2' ? 'Sapiens: A Brief History of Humankind' : 
                  id === '3' ? 'Dune' : 
                  id === '4' ? 'The Silent Patient' : 
                  'Sample Book Title',
            author: id === '1' ? 'F. Scott Fitzgerald' : 
                  id === '2' ? 'Yuval Noah Harari' : 
                  id === '3' ? 'Frank Herbert' : 
                  id === '4' ? 'Alex Michaelides' : 
                  'Sample Author',
            description: 'This is a detailed description of the book. It covers the main themes, plot, and other interesting aspects of the work. Readers will get a sense of what the book is about and whether it might interest them.',
            imageUrl: `https://images.unsplash.com/photo-${id === '1' ? '1544947950-fa07a98d237f' : 
                       id === '2' ? '1589998059171-988d887df646' : 
                       id === '3' ? '1518744386442-2d48ac47a7eb' : 
                       id === '4' ? '1535905557558-afc4877a26fc' : 
                       '1544947950-fa07a98d237f'}?q=80&w=387&auto=format&fit=crop`,
            price: id === '1' ? 12.99 : 
                  id === '2' ? 15.99 : 
                  id === '3' ? 13.99 : 
                  id === '4' ? 11.99 : 
                  10.99,
            rating: id === '1' ? 4.8 : 
                   id === '2' ? 4.7 : 
                   id === '3' ? 4.9 : 
                   id === '4' ? 4.6 : 
                   4.5,
            category: id === '1' ? 'Fiction' : 
                     id === '2' ? 'Non-Fiction' : 
                     id === '3' ? 'Science Fiction' : 
                     id === '4' ? 'Mystery' : 
                     'General',
            quantity: 20,
            publisher: 'Sample Publisher',
            publicationDate: '2020-01-01',
            isbn: '978-3-16-148410-0',
            language: 'English',
            pages: 320
          };
          
          setBook(sampleBook);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (book?.quantity || 1)) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (book?.quantity || 1)) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const addToCartHandler = () => {
    if (book) {
      const cartItem = {
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        imageUrl: book.imageUrl,
      };
      
      addToCart(cartItem, quantity);
      alert(`Added ${quantity} copies of "${book?.title}" to cart`);
    }
  };

  // If loading is true, show a loading spinner
  if (loading) {
    return (
      <div className="container-page flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If there's an error, show error message
  if (error || !book) {
    return (
      <div className="container-page">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md">
          {error || "Book not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page">
      <Link href="/books" className="inline-flex items-center text-primary-600 dark:text-primary-400 mb-6">
        <FiArrowLeft className="mr-2" /> Back to Books
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Book Image */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="aspect-[3/4] relative">
            <img 
              src={book.imageUrl} 
              alt={book.title}
              className="object-cover w-full h-full rounded-md"
            />
            <div className="absolute top-2 right-2 bg-amber-400 text-black px-2 py-1 rounded-full text-sm font-medium flex items-center">
              <FiStar className="mr-1" /> {book.rating}
            </div>
          </div>
        </div>
        
        {/* Book Details */}
        <div>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{book.category}</span>
          <h1 className="text-3xl font-bold mt-2 mb-2 text-gray-900 dark:text-white">{book.title}</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">by {book.author}</p>
          
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ${book.price.toFixed(2)}
          </div>
          
          <div className="prose dark:prose-invert mb-6">
            <p>{book.description}</p>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Quantity: {book.quantity > 0 ? `${book.quantity} in stock` : 'Out of stock'}
            </p>
            <div className="flex">
              <button 
                className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-l-md"
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || book.quantity <= 0}
                aria-label="Decrease quantity"
              >
                <FiMinus />
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange}
                className="form-input w-16 text-center rounded-none"
                min="1" 
                max={book.quantity}
                aria-label="Quantity"
                title="Book quantity"
              />
              <button 
                className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-r-md"
                onClick={increaseQuantity}
                disabled={quantity >= book.quantity || book.quantity <= 0}
                aria-label="Increase quantity"
              >
                <FiPlus />
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              className="btn-primary flex items-center"
              onClick={addToCartHandler}
              disabled={book.quantity <= 0}
            >
              <FiShoppingCart className="mr-2" /> 
              Add to Cart
            </button>
            
            <button className="btn-outline flex items-center">
              <FiHeart className="mr-2" /> 
              Add to Wishlist
            </button>
            
            <button className="btn-outline flex items-center">
              <FiShare2 className="mr-2" /> 
              Share
            </button>
          </div>
          
          {/* Book Additional Info */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-600 dark:text-gray-400">ISBN</span>
              <span className="block font-medium text-gray-900 dark:text-white">{book.isbn || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-600 dark:text-gray-400">Publisher</span>
              <span className="block font-medium text-gray-900 dark:text-white">{book.publisher || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-600 dark:text-gray-400">Publication Date</span>
              <span className="block font-medium text-gray-900 dark:text-white">
                {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-gray-600 dark:text-gray-400">Language</span>
              <span className="block font-medium text-gray-900 dark:text-white">{book.language || 'English'}</span>
            </div>
            <div>
              <span className="block text-gray-600 dark:text-gray-400">Pages</span>
              <span className="block font-medium text-gray-900 dark:text-white">{book.pages || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}