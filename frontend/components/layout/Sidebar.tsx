// filepath: d:\SEM 6 Projects\AWP\Book-Store_management\book-store-management\frontend\components\layout\Sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiBook,
  FiUsers,
  FiShoppingBag,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiLogOut,
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, isMobile = false }) => {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <FiBarChart2 className="w-5 h-5" />,
    },
    {
      title: 'Books',
      path: '/admin/books',
      icon: <FiBook className="w-5 h-5" />,
    },
    {
      title: 'Orders',
      path: '/admin/orders',
      icon: <FiShoppingBag className="w-5 h-5" />,
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: <FiUsers className="w-5 h-5" />,
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: <FiSettings className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg">
      {/* Sidebar Header with Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Admin Panel
        </h2>
        {!isMobile && (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiChevronLeft className={`h-5 w-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
            return (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className={`flex items-center p-2 rounded-md transition-colors
                    ${isOpen ? 'px-4' : 'justify-center'}
                    ${isActive 
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isOpen && <span className="ml-3">{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleLogout}
          className={`flex items-center p-2 w-full rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${isOpen ? 'px-4' : 'justify-center'}
          `}
        >
          <span className="flex-shrink-0">
            <FiLogOut className="w-5 h-5" />
          </span>
          {isOpen && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;