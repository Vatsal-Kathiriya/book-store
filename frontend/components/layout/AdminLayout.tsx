"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiBook, 
  FiUsers, 
  FiShoppingBag, 
  FiBarChart2, 
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { BiBook } from 'react-icons/bi';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

// Option 1: Use export to make it clear this is a module-level interface
export interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for desktop sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // State for mobile sidebar
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not admin or loading
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/login'); // Redirect to login if not admin
      }
    }
  }, [user, loading, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

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

  if (loading || !user || user.role !== 'admin') {
    // Show loading spinner or a placeholder while checking auth/role
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gray-800`} // Added bg-gray-800 for visibility
      >
        <div className="w-64">
          <Sidebar isOpen={true} toggleSidebar={toggleMobileSidebar} isMobile={true} />
        </div>
        {/* Close button inside mobile sidebar area */}
        <button
          onClick={toggleMobileSidebar} // Use the function here too
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
          aria-label="Close sidebar"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>
      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between p-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileSidebar} // Use the function here
            className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Open sidebar"
          >
            <FiMenu className="h-6 w-6" />
          </button>

          {/* Desktop Sidebar Toggle Button (only visible when sidebar is collapsed) */}
          <button
            onClick={toggleSidebar}
            className={`hidden md:block p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${isSidebarOpen ? 'invisible' : ''}`}
            aria-label="Open sidebar"
          >
            <FiMenu className="h-6 w-6" />
          </button>

          {/* Placeholder for other header content like search or user menu */}
          <div className="flex-1"></div> {/* This pushes the user info to the right */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Admin: {user?.name}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;