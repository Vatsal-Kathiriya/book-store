"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

// Reuse the interfaces from the orders page
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Make fetchOrderDetails a useCallback function to prevent unnecessary re-renders
  const fetchOrderDetails = useCallback(async (showRefreshing = true) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        // Prevent caching to always get fresh data
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.order || null);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [params.id]);

  // Auto refresh order details for non-final statuses
  useEffect(() => {
    if (!user || !order) return;
    
    // Only set up auto-refresh for orders that aren't in a final state
    const isFinalStatus = ['delivered', 'cancelled'].includes(order.status.toLowerCase());
    
    if (!isFinalStatus) {
      const refreshInterval = setInterval(() => {
        fetchOrderDetails(false);
      }, 60000); // Refresh every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [user, order, fetchOrderDetails]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=orders/${params.id}`);
      return;
    }

    if (user) {
      fetchOrderDetails();
    }
  }, [user, authLoading, router, params.id, fetchOrderDetails]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiClock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <FiPackage className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <FiTruck className="h-6 w-6 text-indigo-500" />;
      case 'delivered':
        return <FiCheck className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <FiAlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <FiClock className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container-page py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400 mb-4">
          {error}
        </div>
        <button 
          onClick={fetchOrderDetails} 
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-yellow-700 dark:text-yellow-400 mb-4">
          Order not found
        </div>
        <Link href="/orders" className="btn-outline flex items-center w-fit">
          <FiArrowLeft className="mr-2" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/orders" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center w-fit">
          <FiArrowLeft className="mr-2" /> Back to Orders
        </Link>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => fetchOrderDetails()} 
            className="flex items-center px-3 py-2 rounded-md bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30 transition-colors"
            disabled={refreshing}
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Order #{order?._id.substring(order?._id.length - 6).toUpperCase()}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Placed on {order && formatDate(order.createdAt)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {order && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Order Status */}
        {order && (
          <div className="p-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start">
              <div className="mr-4">
                {getStatusIcon(order.status)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Order Status
                </h2>
                
                {order.statusDetails ? (
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 mb-3">
                      {order.statusDetails.message}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {order.statusDetails.currentLocation && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Location</h3>
                          <p className="text-gray-800 dark:text-gray-200">{order.statusDetails.currentLocation}</p>
                        </div>
                      )}
                      
                      {order.statusDetails.nextStep && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Step</h3>
                          <p className="text-gray-800 dark:text-gray-200">{order.statusDetails.nextStep}</p>
                        </div>
                      )}
                      
                      {order.statusDetails.estimatedDelivery && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Delivery</h3>
                          <p className="text-gray-800 dark:text-gray-200">
                            {formatDate(order.statusDetails.estimatedDelivery)}
                          </p>
                        </div>
                      )}
                      
                      {order.trackingNumber && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</h3>
                          <p className="text-gray-800 dark:text-gray-200">
                            {order.trackingNumber}
                            {order.statusDetails.trackingUrl && (
                              <a 
                                href={order.statusDetails.trackingUrl} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-3 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                              >
                                Track Package
                              </a>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Timeline */}
                    {order.statusDetails.statusHistory && order.statusDetails.statusHistory.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Order Timeline</h3>
                        <div className="space-y-6">
                          {order.statusDetails.statusHistory.map((event, index) => (
                            <div key={index} className="flex">
                              <div className="mr-4 relative">
                                <div className={`h-5 w-5 rounded-full ${
                                  index === 0 
                                    ? 'bg-primary-600 dark:bg-primary-500' 
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}></div>
                                {index !== order.statusDetails.statusHistory.length - 1 && (
                                  <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700 absolute top-5 left-2.5 -ml-px"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-8">
                                <div className="flex flex-wrap justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {event.status}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(event.timestamp)}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {event.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    Your order is {order.status.toLowerCase()}.
                    {order.trackingNumber && (
                      <span> Tracking number: <span className="font-medium">{order.trackingNumber}</span></span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Order Items */}
        {order && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Order Items
            </h2>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                    {item.book.imageUrl ? (
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-600">
                        <span className="text-gray-500 dark:text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      {item.book.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.book.author}
                    </p>
                    <div className="mt-1 flex text-sm">
                      <p className="text-gray-600 dark:text-gray-300">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                      {item.discount > 0 && (
                        <p className="ml-2 text-green-600 dark:text-green-400">
                          {item.discount}% off
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      ${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Order Information */}
        {order && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Shipping Address
              </h3>
              <address className="text-sm text-gray-600 dark:text-gray-300 not-italic">
                <p className="font-medium text-gray-800 dark:text-gray-200">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
              </address>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Payment Information
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Method:</span> {order.paymentMethod}
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Status:</span> {order.isPaid ? 'Paid' : 'Not Paid'}
                </p>
                {order.isPaid && order.paidAt && (
                  <p>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Date:</span> {formatDate(order.paidAt)}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Order Summary
              </h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                  <span className="text-gray-800 dark:text-gray-200">${(order.totalPrice - order.shippingPrice - order.taxPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Shipping:</span>
                  <span className="text-gray-800 dark:text-gray-200">${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax:</span>
                  <span className="text-gray-800 dark:text-gray-200">${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span className="font-medium text-gray-800 dark:text-gray-200">Total:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
