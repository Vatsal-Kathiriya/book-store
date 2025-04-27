"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/helpers';

interface Order {
  id: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    book: {
      title: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError('Error loading orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
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

      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError('Error updating order status.');
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6">Order Management</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        ) : orders.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 tracking-wider">Order ID</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 tracking-wider">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 tracking-wider">Items</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 tracking-wider">Total Amount</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      <div>{order.user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{order.user.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="mb-1">
                          {item.book.title} ({item.quantity}) - ${item.price.toFixed(2)}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border rounded py-1 px-2 bg-white dark:bg-gray-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
