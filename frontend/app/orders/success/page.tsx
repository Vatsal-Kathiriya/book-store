"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheck, FiShoppingBag, FiClock } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for your purchase. Your order has been received and is now being processed.
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-8">
          <p className="text-gray-600 dark:text-gray-300 mb-1">Order Number:</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{orderId}</p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          A confirmation email has been sent to your email address.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/books" className="btn-primary flex items-center">
            <FiShoppingBag className="mr-2" /> Continue Shopping
          </Link>
          <Link href={`/orders/${orderId?.replace('ORD-', '')}`} className="btn-outline flex items-center">
            <FiClock className="mr-2" /> Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
