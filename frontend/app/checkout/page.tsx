"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronRight, FiChevronLeft, FiCheck, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Define types for checkout form
interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  saveForNextTime: boolean;
}

interface PaymentInfo {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  saveForNextTime: boolean;
}

// User-specific storage utilities
const getUserStorageKey = (userId, type) => {
  return `bookstore_${userId}_${type}`;
};

const saveUserShippingInfo = (userId, shippingInfo) => {
  if (!userId || !shippingInfo.saveForNextTime) return;
  
  try {
    // Remove the checkbox state before saving
    const { saveForNextTime, ...dataToStore } = shippingInfo;
    localStorage.setItem(getUserStorageKey(userId, 'shipping_info'), JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error saving shipping info:', error);
  }
};

const getUserShippingInfo = (userId) => {
  if (!userId) return null;
  
  try {
    const data = localStorage.getItem(getUserStorageKey(userId, 'shipping_info'));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving shipping info:', error);
    return null;
  }
};

const saveUserPaymentInfo = (userId, paymentInfo) => {
  if (!userId || !paymentInfo.saveForNextTime) return;
  
  try {
    // Store only card name, expiry date, and last 4 digits of the card
    const lastFourDigits = paymentInfo.cardNumber.slice(-4);
    const safePaymentInfo = {
      cardName: paymentInfo.cardName,
      cardNumber: `**** **** **** ${lastFourDigits}`,
      expiryDate: paymentInfo.expiryDate,
      // Do not store CVV for security reasons
    };
    
    localStorage.setItem(getUserStorageKey(userId, 'payment_info'), JSON.stringify(safePaymentInfo));
  } catch (error) {
    console.error('Error saving payment info:', error);
  }
};

const getUserPaymentInfo = (userId) => {
  if (!userId) return null;
  
  try {
    const data = localStorage.getItem(getUserStorageKey(userId, 'payment_info'));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving payment info:', error);
    return null;
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { cart, cartSubtotal, cartTax, cartShipping, cartTotal, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phoneNumber: '',
    saveForNextTime: true,
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveForNextTime: true,
  });

  // Load saved user data when component mounts
  useEffect(() => {
    if (user && user.id) {
      // Load saved shipping info for this specific user
      const savedShippingInfo = getUserShippingInfo(user.id);
      if (savedShippingInfo) {
        setShippingInfo({
          ...savedShippingInfo,
          saveForNextTime: true,
        });
      }
      
      // Load saved payment info for this specific user
      const savedPaymentInfo = getUserPaymentInfo(user.id);
      if (savedPaymentInfo) {
        setPaymentInfo({
          ...paymentInfo,
          ...savedPaymentInfo,
          saveForNextTime: true,
          // Clear CVV since we don't store it
          cvv: '',
        });
      }
    }
    
    setIsLoading(false);
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login?redirect=checkout');
    }
  }, [user, router, authLoading]);

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

  const handleShippingInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
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
    if (paymentMethod !== 'card') return true;
    
    // Basic validation for card payments
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
    // Clear any previous errors
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      if (!validateShippingInfo()) {
        throw new Error('Please complete all required shipping information');
      }
      
      if (paymentMethod === 'card' && !validatePaymentInfo()) {
        throw new Error('Please complete all required payment information');
      }
      
      // Save user shipping/payment info if needed and user is logged in
      if (user && user.id) {
        // Only save info if the user opted to
        if (shippingInfo.saveForNextTime) {
          saveUserShippingInfo(user.id, shippingInfo);
        }
        if (paymentMethod === 'card' && paymentInfo.saveForNextTime) {
          saveUserPaymentInfo(user.id, paymentInfo);
        }
      }
      
      // Create order object from cart and shipping details
      const orderData = {
        items: cart.map(item => ({
          bookId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: shippingInfo.fullName,
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
          phone: shippingInfo.phoneNumber
        },
        paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'PayPal'
      };
      
      // Make the actual API call to create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }
      
      const result = await response.json();
      
      // Use the actual order ID from the API response
      const orderNumber = result.order._id ? `ORD-${result.order._id.substring(0, 6)}` : 
                         'ORD-' + Math.floor(100000 + Math.random() * 900000);
      
      // Order successfully placed
      setOrderNumber(orderNumber);
      setOrderPlaced(true);
      
      // Clear cart after successful order
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      setErrorMessage(error.message || 'There was a problem placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container-page py-8 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            <Link
              href={`/orders/${orderNumber.replace('ORD-', '')}`}
              className="btn-outline"
            >
              View Order Status
            </Link>
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

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}

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
                
                <div className="mb-6">
                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => handlePaymentMethodChange('card')}
                      className={`flex-1 p-4 border rounded-md flex items-center justify-center ${
                        paymentMethod === 'card' 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <FiCreditCard className="mr-2" /> Credit Card
                    </button>
                    <button 
                      type="button"
                      onClick={() => handlePaymentMethodChange('paypal')}
                      className={`flex-1 p-4 border rounded-md flex items-center justify-center ${
                        paymentMethod === 'paypal' 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <span className="font-bold text-blue-600 dark:text-blue-400 mr-1">Pay</span>
                      <span className="font-bold text-blue-800 dark:text-blue-300">Pal</span>
                    </button>
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 gap-6">
                    {/* Card payment fields */}
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
                        id="saveForNextTime"
                        name="saveForNextTime"
                        checked={paymentInfo.saveForNextTime}
                        onChange={handlePaymentInfoChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveForNextTime" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Save this card for future purchases
                      </label>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'paypal' && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-md text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      You will be redirected to PayPal to complete your payment.
                    </p>
                    <div className="inline-block bg-blue-600 text-white font-bold px-4 py-2 rounded-md">
                      <span className="text-blue-100">Pay</span>
                      <span className="text-white">Pal</span>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mt-6">
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
                      {paymentMethod === 'card' 
                        ? `Credit Card ending in ${paymentInfo.cardNumber.slice(-4)}` 
                        : 'PayPal'
                      }
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{paymentMethod === 'card' && paymentInfo.cardName}</p>
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
                    className="btn-primary flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      "Place Order"
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
