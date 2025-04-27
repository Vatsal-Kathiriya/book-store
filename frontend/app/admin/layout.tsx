"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference and localStorage on mount
  useEffect(() => {
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  // Update theme when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // Helper function to determine if a path is active
  const isPathActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === path;
    }
    // For other routes, check if pathname starts with the path but exclude order details
    if (path === '/admin/orders') {
      // Exact match for orders list or one level deep (like /admin/orders/page/2)
      const orderPathParts = pathname.split('/').filter(Boolean);
      return orderPathParts.length <= 3 && pathname.startsWith(path);
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
        </div>
        
        <nav className="mt-6">
          <ul>
            <li>
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isPathActive('/admin/dashboard') 
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                    : ''
                }`}
              >
                <span className="mr-2">📊</span> Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/books" 
                className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isPathActive('/admin/books') 
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                    : ''
                }`}
              >
                <span className="mr-2">📚</span> Books
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/orders" 
                className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isPathActive('/admin/orders') 
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                    : ''
                }`}
              >
                <span className="mr-2">📦</span> Orders
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isPathActive('/admin/users') 
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                    : ''
                }`}
              >
                <span className="mr-2">👥</span> Users
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/settings" 
                className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isPathActive('/admin/settings') 
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                    : ''
                }`}
              >
                <span className="mr-2">⚙️</span> Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-gray-800 dark:text-gray-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}