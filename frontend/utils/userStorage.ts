/**
 * Utility functions for managing user details storage
 * Uses localStorage to persistently store user address and payment info
 */

// Type definitions
export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  saveForNextTime?: boolean;
}

export interface PaymentInfo {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  saveForNextTime?: boolean;
}

// Local storage keys
const SHIPPING_INFO_KEY = 'bookstore_user_shipping_info';
const PAYMENT_INFO_KEY = 'bookstore_user_payment_info';

/**
 * Save shipping information to localStorage
 */
export const saveShippingInfo = (shippingInfo: ShippingInfo): void => {
  if (!shippingInfo.saveForNextTime) return;
  
  try {
    // Remove sensitive flags before storing
    const { saveForNextTime, ...dataToStore } = shippingInfo;
    localStorage.setItem(SHIPPING_INFO_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error saving shipping info:', error);
  }
};

/**
 * Retrieve shipping information from localStorage
 */
export const getShippingInfo = (): ShippingInfo | null => {
  try {
    const data = localStorage.getItem(SHIPPING_INFO_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving shipping info:', error);
    return null;
  }
};

/**
 * Save payment information to localStorage
 * Note: We should only save the cardName and expiry date for security 
 * and replace other details with placeholder values
 */
export const savePaymentInfo = (paymentInfo: PaymentInfo): void => {
  if (!paymentInfo.saveForNextTime) return;
  
  try {
    // Store only the card name and expiry date
    // Store a masked card number (last 4 digits only)
    const lastFourDigits = paymentInfo.cardNumber.slice(-4);
    const maskedCardNumber = `**** **** **** ${lastFourDigits}`;
    
    const safePaymentInfo = {
      cardName: paymentInfo.cardName,
      cardNumber: maskedCardNumber,
      expiryDate: paymentInfo.expiryDate,
      // Do not store CVV for security reasons
    };
    
    localStorage.setItem(PAYMENT_INFO_KEY, JSON.stringify(safePaymentInfo));
  } catch (error) {
    console.error('Error saving payment info:', error);
  }
};

/**
 * Retrieve payment information from localStorage
 */
export const getPaymentInfo = (): Partial<PaymentInfo> | null => {
  try {
    const data = localStorage.getItem(PAYMENT_INFO_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving payment info:', error);
    return null;
  }
};

/**
 * Clear stored user information
 */
export const clearUserInfo = (): void => {
  try {
    localStorage.removeItem(SHIPPING_INFO_KEY);
    localStorage.removeItem(PAYMENT_INFO_KEY);
  } catch (error) {
    console.error('Error clearing user info:', error);
  }
};
