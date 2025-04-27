"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiChevronLeft, FiCheck, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// Define types for checkout form
interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

interface PaymentInfo {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartSubtotal, cartTax, cartShipping, cartTotal, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Form states
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phoneNumber: '',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login?redirect=checkout');
    }
  }, [user, router, isLoading]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [cart, router, orderPlaced]);

  // Auto-fill shipping info if user is logged in
  useEffect(() => {
    if (user) {
      setShippingInfo(prevInfo => ({
        ...prevInfo,
        fullName: user.name || prevInfo.fullName,
      }));
    }
  }, [user]);

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateShippingInfo = () => {
    // Basic validation
    return (
      shippingInfo.fullName &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zipCode &&
      shippingInfo.country
    );
  };

  const validatePaymentInfo = () => {
    // Basic validation
    return (
      paymentInfo.cardName &&
      paymentInfo.cardNumber &&
      paymentInfo.expiryDate &&
      paymentInfo.cvv
    );
  };

  const handleNextStep = () => {
    if (step === 1 && validateShippingInfo()) {
      setStep(2);
    } else if (step === 2 && validatePaymentInfo()) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      // Simulate API call to place order
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate random order number
      const generatedOrderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(generatedOrderNumber);
      setOrderPlaced(true);
      
      // Clear cart after successful order
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render order success screen
  if (orderPlaced) {
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
            <p className="text-xl font-bold text-gray-900 dark:text-white">{orderNumber}</p>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            A confirmation email has been sent to your email address.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/books')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push('/orders')}
              className="btn-outline"
            >
              View Order Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
              step >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-400'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Shipping</span>
          </div>
          <div className={`w-20 h-1 mx-2 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
              step >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-400'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
          <div className={`w-20 h-1 mx-2 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
              step >= 3 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-400'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleShippingInfoChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingInfoChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingInfoChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingInfoChange}
                        className="form-input"
                        required
                      >
                        <option value="USA">United States</option>
                        <option value="CAN">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="IND">India</option>
                        <option value="AUS">Australia</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={shippingInfo.phoneNumber}
                      onChange={handleShippingInfoChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <>
                <h2 className="text-xl font-bold mb-6">Payment Information</h2>
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={paymentInfo.cardName}
                      onChange={handlePaymentInfoChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentInfoChange}
                        className="form-input pl-11"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                      <div className="absolute left-0 top-0 flex items-center h-full ml-3">
                        <FiCreditCard className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentInfoChange}
                        className="form-input"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentInfoChange}
                        className="form-input"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveCard"
                      name="saveCard"
                      checked={paymentInfo.saveCard}
                      onChange={handlePaymentInfoChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Save this card for future purchases
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your payment information is encrypted and secure. We never store your full credit card details.
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <>
                <h2 className="text-xl font-bold mb-6">Review Your Order</h2>
                
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Shipping Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-6">
                  <p className="text-gray-800 dark:text-gray-200">{shippingInfo.fullName}</p>
                  <p className="text-gray-600 dark:text-gray-300">{shippingInfo.address}</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">{shippingInfo.country}</p>
                  {shippingInfo.phoneNumber && (
                    <p className="text-gray-600 dark:text-gray-300">{shippingInfo.phoneNumber}</p>
                  )}
                </div>
                
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Method</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-6 flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded mr-3">
                    <FiCreditCard className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-200">
                      Credit Card ending in {paymentInfo.cardNumber.slice(-4)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{paymentInfo.cardName}</p>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Order Items</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                      <div className="flex items-center">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-12 h-16 object-cover rounded mr-3"
                        />
                        <div>
                          <p className="text-gray-800 dark:text-gray-200 font-medium">{item.title}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="btn-outline flex items-center"
                >
                  <FiChevronLeft className="mr-1" /> Back
                </button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary flex items-center"
                    disabled={
                      (step === 1 && !validateShippingInfo()) || 
                      (step === 2 && !validatePaymentInfo())
                    }
                  >
                    Next <FiChevronRight className="ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="btn-primary flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      <span>Place Order</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                  <p className="text-gray-700 dark:text-gray-300">
                    {item.title} <span className="text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                  </p>
                  <p className="text-gray-800 dark:text-white font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
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
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">We Accept</p>
              <div className="flex space-x-2">
                <div className="bg-blue-500 text-white rounded p-1 w-12 h-7 flex items-center justify-center text-xs">
                  VISA
                </div>
                <div className="bg-blue-700 text-white rounded p-1 w-12 h-7 flex items-center justify-center text-xs">
                  PAYPAL
                </div>
                <div className="bg-red-500 text-white rounded p-1 w-12 h-7 flex items-center justify-center text-xs">
                  MC
                </div>
                <div className="bg-gray-700 text-white rounded p-1 w-12 h-7 flex items-center justify-center text-xs">
                  AMEX
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
