"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FiPackage, FiTruck, FiCheck, FiClock, FiAlertCircle, FiChevronRight, FiShoppingBag, FiInfo } from 'react-icons/fi';

interface BookItem {
  _id: string;
  title: string;
  author: string;
  imageUrl: string;
  price: number;
}

interface OrderItem {
  book: BookItem;
  quantity: number;
  price: number;
  discount: number;
}

interface StatusDetails {
  timestamp: string;
  message: string;
  estimatedDelivery?: string;
  currentLocation?: string;
  nextStep?: string;
  trackingUrl?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    message: string;
  }>;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  status: string;
  statusDetails?: StatusDetails;
  paymentMethod: string;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=orders');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/30 p-6 border-b border-red-100 dark:border-red-800">
            <div className="flex items-center">
              <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h2 className="ml-3 text-lg font-medium text-red-800 dark:text-red-300">Error Loading Orders</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-800 dark:text-gray-200 mb-4">{error}</p>
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
              aria-label="Try loading orders again"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-5">
              <FiShoppingBag className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Orders Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You haven't placed any orders yet.</p>
            <Link 
              href="/books"
              className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-200"
            >
              Start Shopping
              <FiChevronRight className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Orders list
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          View and track all your recent orders
        </p>
      </header>

      <div className="space-y-8">
        {orders.map((order) => (
          <div 
            key={order._id} 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Order Header */}
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                {/* Order ID and Date */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Order
                    </h2>
                    <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">
                      <span className="font-mono text-gray-900 dark:text-white font-medium">
                        #{getShortenedId(order._id)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                    <FiClock className="mr-1.5 h-4 w-4" />
                    <span>Placed on {formatDate(order.createdAt)}</span>
                  </div>
                </div>

                {/* Price and Items */}
                <div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      ${order.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {getTotalItems(order)} item{getTotalItems(order) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1.5">{order.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Body */}
            <div className="p-6">
              {/* Status Details */}
              {order.statusDetails && (
                <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <FiInfo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        Shipping Information
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-blue-800 dark:text-blue-300 flex justify-between">
                          <span className="font-medium">Current location:</span>
                          <span>{order.statusDetails.currentLocation}</span>
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 flex justify-between">
                          <span className="font-medium">Estimated delivery:</span>
                          <span>{formatDate(order.statusDetails.estimatedDelivery, true)}</span>
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 flex justify-between">
                          <span className="font-medium">Next step:</span>
                          <span>{order.statusDetails.nextStep}</span>
                        </p>
                        {order.trackingNumber && (
                          <div className="text-sm flex justify-between items-center pt-1 border-t border-blue-200 dark:border-blue-800 mt-2">
                            <span className="font-medium text-blue-800 dark:text-blue-300">Tracking:</span>
                            <span className="font-mono text-blue-800 dark:text-blue-300">{order.trackingNumber}</span>
                            {order.statusDetails.trackingUrl && (
                              <a 
                                href={order.statusDetails.trackingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                aria-label="Track your shipment"
                              >
                                Track
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Items in this order
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-3 bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="relative h-20 w-14 flex-shrink-0">
                      <div className="absolute inset-0 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {item.book?.imageUrl ? (
                          <Image
                            src={item.book.imageUrl}
                            alt={item.book.title}
                            width={56}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-400 dark:text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {item.book?.title || 'Unknown Book'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                        by {item.book?.author || 'Unknown Author'}
                      </p>
                      <div className="flex items-center mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-2">Qty: {item.quantity}</span>
                        {item.discount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded">
                            {item.discount}% off
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                      </div>
                      {item.discount > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end mt-6">
                <Link
                  href={`/orders/${order._id}`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-200"
                >
                  View order details <FiChevronRight className="ml-1.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get status icon
function getStatusIcon(status: string) {
  const className = "h-4 w-4";
  
  switch (status.toLowerCase()) {
    case 'pending':
      return <FiClock className={className} />;
    case 'processing':
      return <FiPackage className={className} />;
    case 'shipped':
      return <FiTruck className={className} />;
    case 'delivered':
      return <FiCheck className={className} />;
    case 'cancelled':
      return <FiAlertCircle className={className} />;
    default:
      return <FiClock className={className} />;
  }
}

// Helper function for status badge styling
function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/60';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/60';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/60';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
  }
}

// Helper function to get total items
function getTotalItems(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

// Helper function to format date
function formatDate(dateString: string, includeTime = false): string {
  if (!dateString) return 'N/A';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid Date';
  }
}

// Helper function to get shortened ID
function getShortenedId(orderId: string | undefined): string {
  if (!orderId) return 'N/A';
  
  // Use last 6 characters if order ID is long enough
  if (orderId.length >= 6) {
    return orderId.substring(orderId.length - 6).toUpperCase();
  } 
  
  // Otherwise use the full ID
  return orderId.toUpperCase();
}
