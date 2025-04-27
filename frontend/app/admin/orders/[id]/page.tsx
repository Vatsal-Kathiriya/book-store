"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiRefreshCw, FiCheck, FiX, FiSave } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  book: {
    _id: string;
    title: string;
    author: string;
    imageUrl: string;
    price: number;
  };
  quantity: number;
  price: number;
  discount: number;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  status: string;
  paymentMethod: string;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false); // Specific state for not found errors
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({
    status: '',
    trackingNumber: ''
  });
  // Add polling state
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Create a fetchOrderDetails function that can be reused
  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      if (loading) setLoading(true);
      
      const response = await fetch(`/api/admin/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        setNotFound(true);
        setError('');
        setOrder(null);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Failed to fetch order details: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.order) {
        throw new Error('Order data not found in response');
      }
      
      setOrder(data.order);
      setNotFound(false);
      setError('');
      
      // Initialize edited values
      setEditedValues({
        status: data.order.status,
        trackingNumber: data.order.trackingNumber || ''
      });
      
      // Update last fetched timestamp
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching order details:', err);
      if (err.message.includes('404') || err.message.includes('not found')) {
        setNotFound(true);
        setError('');
      } else {
        setError(`Unable to load order details: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Redirect if not authenticated as admin
    if (!authLoading && (!authUser || authUser.role !== 'admin')) {
      router.push('/login?redirect=/admin/orders');
      return;
    }

    if (authUser?.role === 'admin') {
      fetchOrderDetails();
    }
  }, [authUser, authLoading, router, fetchOrderDetails]);

  // Set up polling for real-time updates
  useEffect(() => {
    // Fix the condition: !authUser?.role === 'admin' is always false
    // The correct way to check is authUser?.role === 'admin'
    if (!isPolling || !id || authUser?.role !== 'admin') return;
    
    const intervalId = setInterval(() => {
      // Only fetch if we're not already loading and not editing
      if (!loading && !isEditing) {
        console.log("Polling for order updates...");
        fetchOrderDetails();
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchOrderDetails, isPolling, loading, isEditing, id, authUser?.role]);

  // Format date strings
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save changes
  const saveChanges = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: editedValues.status,
          trackingNumber: editedValues.trackingNumber || undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update order: ${errorText}`);
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder.order);
      setSuccess('Order updated successfully');
      setIsEditing(false);
      setLastUpdated(new Date());

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating order:', err);
      setError(`Failed to update order: ${err.message}`);
    }
  };

  // Enable/disable polling
  const togglePolling = () => {
    setIsPolling(prev => !prev);
    if (!isPolling) {
      // If we're turning polling back on, fetch immediately
      fetchOrderDetails();
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchOrderDetails();
  };

  // Enable editing
  const enableEditing = () => {
    setIsEditing(true);
    setIsPolling(false); // Pause polling while editing
    setSuccess('');
    setError('');
  };

  // Cancel editing
  const cancelEditing = () => {
    if (order) {
      setEditedValues({
        status: order.status,
        trackingNumber: order.trackingNumber || ''
      });
    }
    setIsEditing(false);
    setIsPolling(true); // Resume polling
    setError('');
  };

  if (loading) {
    return (
        <div className="p-6 flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
    );
  }

  // Handle not found case with custom UI
  if (notFound) {
    return (
        <div className="container-page py-12">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiX className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order not found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              It may have been deleted or the ID is incorrect.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-outline flex items-center justify-center"
              >
                Try Again
              </button>
              <Link
                href="/admin/orders"
                className="btn-primary flex items-center justify-center"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
    );
  }

  if (error && !order) {
    return (
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
            <p className="text-lg font-medium text-red-700 dark:text-red-400">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 btn btn-outline text-red-600 dark:text-red-400"
            >
              Try Again
            </button>
          </div>
        </div>
    );
  }

  if (!order) {
    return (
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
            <p className="text-lg font-medium text-yellow-700 dark:text-yellow-400">Order not found</p>
            <Link href="/admin/orders" className="mt-4 btn btn-primary inline-block">
              Back to Orders
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin/orders" className="mr-4 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order._id.substring(order._id.length - 6).toUpperCase()}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Real-time update indicator */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {isPolling ? 'Auto-refreshing' : 'Updates paused'} • 
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </div>
            
            {/* Refresh button */}
            <button 
              onClick={togglePolling}
              className="btn-icon text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              title={isPolling ? "Pause auto-updates" : "Enable auto-updates"}
            >
              <FiRefreshCw className={`w-5 h-5 ${isPolling ? 'animate-spin' : ''}`} />
            </button>
            
            {isEditing ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={cancelEditing} 
                  className="btn-outline flex items-center text-red-600 dark:text-red-400"
                >
                  <FiX className="mr-1" /> Cancel
                </button>
                <button 
                  onClick={saveChanges} 
                  className="btn-primary flex items-center"
                >
                  <FiSave className="mr-1" /> Save Changes
                </button>
              </div>
            ) : (
              <button 
                onClick={enableEditing} 
                className="btn-outline flex items-center"
              >
                <FiEdit className="mr-1" /> Edit Order
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Status</h2>
            {isEditing ? (
              <div className="w-48">
                <select
                  name="status"
                  value={editedValues.status}
                  onChange={handleChange}
                  className="form-select w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            ) : (
              <div>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="w-full md:w-1/2 mb-2 md:mb-0">
              <span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}
            </div>
            <div className="w-full md:w-1/2">
              <span className="font-medium">Last Updated:</span> {formatDate(order.updatedAt)}
            </div>
          </div>
          
          {/* Tracking Number */}
          <div className="mt-4">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking Number:</div>
            {isEditing ? (
              <input
                type="text"
                name="trackingNumber"
                value={editedValues.trackingNumber}
                onChange={handleChange}
                placeholder="Enter tracking number"
                className="form-input w-full md:w-1/2"
              />
            ) : (
              <div className="text-gray-900 dark:text-white">
                {order.trackingNumber || 'Not available'}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-12 w-10 flex-shrink-0 mr-3 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                              <img 
                                src={item.book.imageUrl || '/images/book-placeholder.png'} 
                                alt={item.book.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.book.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          ${item.price.toFixed(2)}
                          {item.discount > 0 && (
                            <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                              -{item.discount}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.price * item.quantity * (1 - (item.discount || 0)/100)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 dark:border-gray-700">
                    <tr>
                      <td colSpan={2} className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        ${(order.totalPrice - order.shippingPrice - order.taxPrice).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Shipping</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        ${order.shippingPrice.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Tax</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                        ${order.taxPrice.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Customer and Payment Info */}
          <div className="lg:col-span-1">
            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Customer Information</h2>
              <div className="mb-4">
                <div className="font-medium text-gray-700 dark:text-gray-300">Name:</div>
                <div className="text-gray-900 dark:text-white">{order.user.name}</div>
              </div>
              <div className="mb-4">
                <div className="font-medium text-gray-700 dark:text-gray-300">Email:</div>
                <div className="text-gray-900 dark:text-white">{order.user.email}</div>
              </div>
              <Link 
                href={`/admin/users/${order.user._id}`} 
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center text-sm font-medium"
              >
                View Customer Profile
              </Link>
            </div>

            {/* Shipping Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Shipping Information</h2>
              <div className="mb-4">
                <div className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.name}</div>
                <div className="text-gray-600 dark:text-gray-400">{order.shippingAddress.street}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{order.shippingAddress.country}</div>
                {order.shippingAddress.phone && (
                  <div className="text-gray-600 dark:text-gray-400 mt-2">
                    Phone: {order.shippingAddress.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Information</h2>
              <div className="mb-4">
                <div className="font-medium text-gray-700 dark:text-gray-300">Method:</div>
                <div className="text-gray-900 dark:text-white">{order.paymentMethod}</div>
              </div>
              <div className="mb-4">
                <div className="font-medium text-gray-700 dark:text-gray-300">Status:</div>
                <div className={`font-medium ${order.isPaid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {order.isPaid ? 'Paid' : 'Pending Payment'}
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Paid on {formatDate(order.paidAt.toString())}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
