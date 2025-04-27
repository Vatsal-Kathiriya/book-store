"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBook, FiBookOpen, FiArrowRight, FiStar } from 'react-icons/fi';

export default function Home() {
  // Sample featured books data (replace with API call in production)
  const [featuredBooks, setFeaturedBooks] = useState([
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop",
      price: 12.99,
      rating: 4.8,
      category: "Fiction"
    },
    {
      id: 2,
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1776&auto=format&fit=crop",
      price: 15.99,
      rating: 4.7,
      category: "Non-Fiction"
    },
    {
      id: 3,
      title: "Dune",
      author: "Frank Herbert",
      cover: "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?q=80&w=1776&auto=format&fit=crop",
      price: 13.99,
      rating: 4.9,
      category: "Science Fiction"
    },
    {
      id: 4,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      cover: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1974&auto=format&fit=crop",
      price: 11.99,
      rating: 4.6,
      category: "Mystery"
    }
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Discover Your Next Favorite Book</h1>
              <p className="text-lg md:text-xl">Explore our vast collection of books across all genres. From bestselling fiction to educational resources.</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/books" className="btn-primary px-8 py-3 rounded-lg inline-flex items-center z-10 relative">
                  Browse Books <FiArrowRight className="ml-2" />
                </Link>
                <Link href="/register" className="btn-outline bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-700 px-8 py-3 rounded-lg z-10 relative">
                  Join Now
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="book-stack relative">
                {/* Stacked books illustration */}
                <div className="absolute book-1 shadow-xl rounded-md h-64 w-48 bg-amber-100 transform rotate-6 border-r-8 border-amber-700"></div>
                <div className="absolute book-2 shadow-xl rounded-md h-64 w-48 bg-emerald-100 transform -rotate-3 border-r-8 border-emerald-700"></div>
                <div className="absolute book-3 shadow-xl rounded-md h-64 w-48 bg-rose-100 transform rotate-12 border-r-8 border-rose-700"></div>
                <div className="absolute book-4 shadow-xl rounded-md h-64 w-48 bg-purple-100 transform -rotate-12 border-r-8 border-purple-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-12">
        <div className="container-page">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Books</h2>
            <Link href="/books" className="btn-outline flex items-center text-primary-600">
              View All <FiArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <div key={book.id} className="card group">
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-amber-400 text-black px-2 py-1 rounded-full text-sm font-medium flex items-center">
                    <FiStar className="mr-1" /> {book.rating}
                  </div>
                </div>
                {/* Updated this part for better visibility */}
                <div className="p-4 bg-white dark:bg-gray-800">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{book.category}</span>
                  <h3 className="font-bold text-lg mt-1 text-gray-900 dark:text-white text-ellipsis overflow-hidden">{book.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{book.author}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">${book.price.toFixed(2)}</span>
                    <button className="btn-primary text-sm py-1 text-white">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container-page">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery'].map((category) => (
              <Link key={category} href={`/books?category=${category}`} className="category-card">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 text-center transition-transform hover:scale-105 hover:shadow-lg">
                  <div className="bg-primary-100 dark:bg-primary-900/30 h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4">
                    <FiBook className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-bold text-lg">{category}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Explore our collection</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated with New Releases</h2>
            <p className="mb-6">Subscribe to our newsletter and be the first to know about new books, exclusive offers, and reading recommendations.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input 
                type="email" 
                className="form-input flex-grow text-gray-900 dark:text-white" 
                placeholder="Your email address" 
                required 
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12">
        <div className="container-page">
          <h2 className="text-3xl font-bold mb-8 text-center">What Our Readers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "This bookstore has transformed my reading experience. The selection is unmatched and delivery is always prompt!",
                name: "Emma Thompson",
                role: "Avid Reader"
              },
              {
                text: "I appreciate the personalized recommendations. They really understand what books will appeal to different readers.",
                name: "Michael Chen",
                role: "Book Club Organizer"
              },
              {
                text: "The rare editions section is incredible. I've found books here that I couldn't locate anywhere else for years.",
                name: "Sarah Johnson",
                role: "Collector"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
