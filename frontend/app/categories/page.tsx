"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBook, FiChevronRight } from 'react-icons/fi';

// Define the category type
interface Category {
  id: string;
  name: string;
  description: string;
  bookCount: number;
}

export default function Categories() {
  // Sample data - in a real app, this would come from an API
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'fiction',
      name: 'Fiction',
      description: 'Novels, short stories, and narratives that are imaginative works of prose.',
      bookCount: 42
    },
    {
      id: 'non-fiction',
      name: 'Non-Fiction',
      description: 'Literature that is based on facts and real events.',
      bookCount: 36
    },
    {
      id: 'science-fiction',
      name: 'Science Fiction',
      description: 'Fiction based on imagined future scientific or technological advances.',
      bookCount: 28
    },
    {
      id: 'mystery',
      name: 'Mystery',
      description: 'Fiction dealing with the solution of a crime or the unraveling of secrets.',
      bookCount: 31
    },
    {
      id: 'romance',
      name: 'Romance',
      description: 'Stories that focus on the romantic relationships between characters.',
      bookCount: 33
    },
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: 'Fiction with elements that do not exist in the real world.',
      bookCount: 25
    },
    {
      id: 'biography',
      name: 'Biography',
      description: 'Detailed descriptions of a person\'s life and experiences.',
      bookCount: 19
    },
    {
      id: 'history',
      name: 'History',
      description: 'Books that record and explain past events.',
      bookCount: 22
    }
  ]);
  
  const [loading, setLoading] = useState(false);

  // In a real app, you would fetch categories from an API
  useEffect(() => {
    // Simulating API loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);
  
  if (loading) {
    return (
      <div className="container-page flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/books?category=${category.id}`}
            className="block group"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-3 rounded-full">
                  <FiBook className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-4">{category.name}</h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4">
                {category.description}
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {category.bookCount} {category.bookCount === 1 ? 'book' : 'books'}
                </span>
                
                <span className="text-primary-600 dark:text-primary-400 flex items-center group-hover:translate-x-1 transition-transform duration-200">
                  Browse <FiChevronRight className="ml-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}