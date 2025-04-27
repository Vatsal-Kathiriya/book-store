"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ThemeToggle } from '../ui/ThemeToggle';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart(); // Using cartCount directly from context
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push('/profile');
  };

  const handleOrdersClick = () => {
    setIsDropdownOpen(false);
    router.push('/orders');
  };

  // Navigation links
  const navLinks = [
    { text: 'Home', href: '/' },
    { text: 'Books', href: '/books' },
    { text: 'Categories', href: '/categories' },
    { text: 'About', href: '/about' },
    { text: 'Contact', href: '/contact' },
  ];

  return React.createElement(
    'header',
    { className: "bg-white dark:bg-gray-900 shadow-sm" },
    React.createElement(
      'div',
      { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
      React.createElement(
        'div',
        { className: "flex justify-between h-16" },
        // Logo section
        React.createElement(
          'div',
          { className: "flex items-center" },
          React.createElement(
            Link,
            { href: "/", className: "flex-shrink-0 flex items-center" },
            React.createElement(
              'div',
              { className: "bg-primary-600 text-white p-2 rounded" },
              React.createElement(FiUser, { className: "h-6 w-6" })
            ),
            React.createElement(
              'span',
              { className: "ml-2 text-xl font-bold text-gray-900 dark:text-white" },
              "BookStore"
            )
          )
        ),
        
        // Desktop navigation
        React.createElement(
          'nav',
          { className: "hidden md:flex space-x-8 items-center" },
          navLinks.map(link => 
            React.createElement(
              Link,
              { 
                key: link.href, 
                href: link.href,
                className: `text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 ${
                  pathname === link.href ? 'text-primary-600 dark:text-primary-400' : ''
                }`
              },
              link.text
            )
          )
        ),
        
        // Right side - User menu & cart
        React.createElement(
          'div',
          { className: "hidden md:flex items-center space-x-4" },
          // Cart link - UPDATED with direct cartCount usage
          React.createElement(
            Link,
            { 
              href: "/cart", 
              className: "relative text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400" 
            },
            React.createElement(FiShoppingCart, { className: "h-6 w-6" }),
            cartCount > 0 && React.createElement(
              'span',
              { 
                className: "absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
                style: { fontWeight: 'bold' }
              },
              cartCount
            )
          ),
          
          // User or login/register
          isMounted && user ? 
            React.createElement(
              'div',
              { className: "relative", ref: dropdownRef },
              // User button
              React.createElement(
                'button',
                { 
                  onClick: toggleDropdown,
                  className: "flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                },
                React.createElement('span', {}, `Welcome, ${user.name.split(' ')[0]}`),
                React.createElement(FiUser, { className: "text-xl" })
              ),
              
              // Dropdown
              isDropdownOpen && React.createElement(
                'div',
                { className: "absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50" },
                React.createElement(
                  'div',
                  { className: "py-1" },
                  // Profile button
                  React.createElement(
                    'button',
                    { 
                      onClick: handleProfileClick,
                      className: "w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    },
                    "Profile"
                  ),
                  // Orders button
                  React.createElement(
                    'button',
                    { 
                      onClick: handleOrdersClick,
                      className: "w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    },
                    "Orders"
                  ),
                  // Sign out button
                  React.createElement(
                    'button',
                    { 
                      onClick: handleSignOut,
                      className: "w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    },
                    "Sign Out"
                  )
                )
              )
            ) : 
            React.createElement(
              'div',
              { className: "flex space-x-4" },
              // Login link
              React.createElement(
                Link,
                { 
                  href: "/login", 
                  className: "text-primary-600 px-4 py-2 rounded-md hover:text-primary-700"
                },
                "Login"
              ),
              // Sign up link
              React.createElement(
                Link,
                { 
                  href: "/register", 
                  className: "bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                },
                "Sign Up"
              )
            ),
          
          // Theme toggle
          React.createElement(ThemeToggle, {})
        ),
        
        // Mobile menu button
        React.createElement(
          'div',
          { className: "flex items-center md:hidden" },
          React.createElement(
            'button',
            {
              onClick: toggleMenu,
              className: "inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400",
              'aria-expanded': "false"
            },
            React.createElement('span', { className: "sr-only" }, "Open main menu"),
            isMenuOpen ? 
              React.createElement(FiX, { className: "block h-6 w-6" }) : 
              React.createElement(FiMenu, { className: "block h-6 w-6" })
          )
        )
      )
    ),
    
    // Mobile menu with updated cart badge
    isMenuOpen && React.createElement(
      'div',
      { className: "md:hidden" },
      React.createElement(
        'div',
        { className: "px-2 pt-2 pb-3 space-y-1 sm:px-3" },
        // Mobile nav links
        navLinks.map(link => 
          React.createElement(
            Link,
            {
              key: link.href,
              href: link.href,
              className: `block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700'
              }`,
              onClick: closeMenu
            },
            link.text
          )
        ),
        
        // Mobile cart link
        React.createElement(
          Link,
          {
            href: "/cart",
            className: "relative flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700",
            onClick: closeMenu
          },
          "Cart",
          isMounted && cartCount > 0 && React.createElement(
            'span',
            {
              className: "ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
              style: { fontWeight: 'bold' }
            },
            cartCount
          )
        ),
        
        // Mobile user menu or login/register
        isMounted && user ? 
          [
            React.createElement('div', { className: "border-t border-gray-200 dark:border-gray-700 my-2", key: "divider" }),
            React.createElement(
              'div', 
              { className: "px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400", key: "welcome" },
              `Welcome, ${user.name}`
            ),
            React.createElement(
              Link,
              {
                href: "/profile",
                className: "block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700",
                onClick: closeMenu,
                key: "profile"
              },
              "Profile"
            ),
            React.createElement(
              Link,
              {
                href: "/orders",
                className: "block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700",
                onClick: closeMenu,
                key: "orders"
              },
              "My Orders"
            ),
            user.role === 'admin' && React.createElement(
              Link,
              {
                href: "/admin",
                className: "block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700",
                onClick: closeMenu,
                key: "admin"
              },
              "Admin Dashboard"
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  logout();
                  closeMenu();
                  router.push('/');
                },
                className: "block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700",
                key: "signout"
              },
              "Sign Out"
            )
          ] : 
          [
            React.createElement('div', { className: "border-t border-gray-200 dark:border-gray-700 my-2", key: "divider" }),
            React.createElement(
              Link,
              {
                href: "/login",
                className: "block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700",
                onClick: closeMenu,
                key: "login"
              },
              "Login"
            ),
            React.createElement(
              Link,
              {
                href: "/register",
                className: "block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700",
                onClick: closeMenu,
                key: "register"
              },
              "Sign Up"
            )
          ]
      )
    )
  );
};

export default Header;