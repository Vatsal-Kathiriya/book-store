import Link from 'next/link';
import { BiBook } from 'react-icons/bi';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BiBook className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">BookStore</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your one-stop destination for all your literary needs. Browse, buy, and manage books with ease.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/books" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Book Catalog
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/books?category=fiction" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=non-fiction" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Non-Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=sci-fi" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Science Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=mystery" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                  Mystery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Email: contact@bookstore.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {currentYear} BookStore Management System. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400">Privacy Policy</Link>
            {' | '}
            <Link href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}