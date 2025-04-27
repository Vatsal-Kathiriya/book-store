"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartTax, cartShipping, cartTotal } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the cart data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleQuantityChange = (bookId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(bookId, newQuantity);
    }
  };

  const handleRemoveItem = (bookId: string) => {
    removeFromCart(bookId);
  };

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container-page flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-page py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Your cart is empty</p>
          <Link href="/books" className="btn-primary inline-flex items-center">
            <FiArrowLeft className="mr-2" /> Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="col-span-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Product</div>
              <div className="col-span-2 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Price</div>
              <div className="col-span-2 text-sm font-semibold text-gray-600 dark:text-gray-300 text-center">Quantity</div>
              <div className="col-span-2 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Total</div>
            </div>
            
            {/* Cart Items */}
            {cart.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 items-center">
                {/* Product Info */}
                <div className="col-span-1 md:col-span-6 flex items-center">
                  <div className="w-20 h-24 flex-shrink-0 mr-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.author}</p>
                  </div>
                </div>
                
                {/* Price */}
                <div className="col-span-1 md:col-span-2 text-right">
                  <span className="md:hidden inline-block mr-2 text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="font-medium text-gray-800 dark:text-white">${item.price.toFixed(2)}</span>
                </div>
                
                {/* Quantity */}
                <div className="col-span-1 md:col-span-2 flex justify-center">
                  <div className="quantity-selector">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >-</button>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      className="w-12 text-center"
                      aria-label="Quantity"
                    />
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
                
                {/* Total */}
                <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center">
                  <span className="md:hidden text-gray-600 dark:text-gray-400">Total:</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-white mr-4">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Link href="/books" className="inline-flex items-center text-primary-600 dark:text-primary-400">
              <FiArrowLeft className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-800 dark:text-white">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-800 dark:text-white">${cartShipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="font-medium text-gray-800 dark:text-white">${cartTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleProceedToCheckout}
              className="btn-primary w-full py-3"
            >
              Proceed to Checkout
            </button>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">We Accept</p>
              <div className="flex space-x-2">
                <div className="bg-blue-500 text-white rounded p-1 w-10 h-6 flex items-center justify-center">
                  VISA
                </div>
                <div className="bg-blue-700 text-white rounded p-1 w-10 h-6 flex items-center justify-center">
                  PP
                </div>
                <div className="bg-red-500 text-white rounded p-1 w-10 h-6 flex items-center justify-center">
                  MC
                </div>
                <div className="bg-gray-700 text-white rounded p-1 w-10 h-6 flex items-center justify-center">
                  AE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}