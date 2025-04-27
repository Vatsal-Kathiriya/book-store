"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEdit, FiSave, FiX, FiEye, FiFilter, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  book: {
    title: string;
    _id: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalPrice: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  isPaid: boolean;
  isDelivered: boolean;
}

export default function AdminOrdersPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '7days',
    search: '',
  });
  
  // Add state for tracking which order is being edited
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query string
      let queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await fetch(`/api/admin/orders?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate the received data
      if (!data.orders || !Array.isArray(data.orders)) {
        throw new Error('Invalid orders data received from server');
      }
      
      // Filter out any invalid order entries
      const validOrders = data.orders.filter(order => order && order._id);
      setOrders(validOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(`Error loading orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication and fetch orders
  useEffect(() => {
    if (!authLoading) {
      if (!authUser || authUser.role !== 'admin') {
        router.push('/login?redirect=/admin/orders');
        return;
      }
      
      fetchOrders();
    }
  }, [authUser, authLoading, router]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setError('');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the local orders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Exit edit mode after successful update
      setEditingOrderId(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Error updating order status. Please try again.');
    }
  };
  
  // Handle enabling edit mode for an order
  const handleEditClick = (orderId: string) => {
    setEditingOrderId(orderId);
  };
  
  // Handle cancelling edit mode
  const handleCancelEdit = () => {
    setEditingOrderId(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Safe function to get shortened order ID
  const getShortenedId = (orderId: string | undefined): string => {
    if (!orderId) return 'N/A';
    try {
      return orderId.substring(orderId.length - 6).toUpperCase();
    } catch (err) {
      console.error('Error formatting order ID:', err);
      return 'ID ERROR';
    }
  };

  // Function to ensure order ID is valid for linking
  const getOrderDetailLink = (orderId: string | undefined): string => {
    if (!orderId || orderId.length < 6) return '#';
    return `/admin/orders/${orderId}`;
  };

  // Safe function to get total items, handling possible undefined items
  const getTotalItems = (order: Order) => {
    if (!order.items || !Array.isArray(order.items)) {
      return 0;
    }
    return order.items.reduce((total, item) => total + (item?.quantity || 0), 0);
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchOrders();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      dateRange: '7days',
      search: '',
    });
    fetchOrders();
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
        <button 
          onClick={() => fetchOrders()}
          className="btn-outline flex items-center text-sm px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiRefreshCw className="mr-2" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm mb-6 transition-all">
        <div className="flex items-center mb-4">
          <FiFilter className="mr-2 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-select block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <select
              id="dateRange"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="form-select block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Orders
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Order ID, customer name or email"
              className="form-input block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="w-full sm:w-auto btn-primary px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="w-full sm:w-auto btn-outline px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 dark:text-gray-400">No orders found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-750">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order, index) => (
                  <tr key={order._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getShortenedId(order._id)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.paymentMethod || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.user?.email || 'No email provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.createdAt ? formatDate(order.createdAt) : 'Date unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getTotalItems(order)} items
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {order.items && Array.isArray(order.items) && order.items.slice(0, 2).map(item => 
                          item?.book?.title || 'Untitled Book'
                        ).join(', ')}
                        {order.items && order.items.length > 2 ? ', ...' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${(order.totalPrice || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* Edit Mode */}
                        {editingOrderId === order._id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={order.status || 'Pending'}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className="form-select w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex items-center space-x-2">
                            <span className={`status-badge ${order.status?.toLowerCase()}`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => handleEditClick(order._id)}
                              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order._id ? (
                        <Link 
                          href={getOrderDetailLink(order._id)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                        >
                          <FiEye className="mr-1" /> View
                        </Link>
                      ) : (
                        <span className="text-gray-400">No details</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
