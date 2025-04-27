"use client"; // Add this line

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-[150px] font-bold text-primary-400">404</h1>
      
      <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <Link 
          href="/" 
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center"
        >
          Go to Homepage
        </Link>
        <Link 
          href="javascript:history.back()" 
          className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Go Back
        </Link>
      </div>
      
      <div className="mt-12 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Popular Pages</h3>
        <ul className="flex flex-col gap-2">
          <li>
            <Link href="/books" className="text-primary-600 dark:text-primary-400 hover:underline">
              Browse Books
            </Link>
          </li>
          <li>
            <Link href="/categories" className="text-primary-600 dark:text-primary-400 hover:underline">
              Categories
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}