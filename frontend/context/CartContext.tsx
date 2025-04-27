"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartShipping: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartSubtotal: 0,
  cartTax: 0,
  cartShipping: 0,
  cartTotal: 0,
});

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartTax, setCartTax] = useState(0);
  const [cartShipping, setCartShipping] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
    
    // Calculate cart count (total number of items)
    const newCount = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(newCount);
    
    // Calculate cart subtotal
    const newSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    setCartSubtotal(newSubtotal);
    
    // Calculate tax (assuming 7% tax rate)
    const newTax = newSubtotal * 0.07;
    setCartTax(newTax);
    
    // Calculate shipping (free for orders over $35, otherwise $4.99)
    const newShipping = newSubtotal >= 35 ? 0 : 4.99;
    setCartShipping(newShipping);
    
    // Calculate total
    const newTotal = newSubtotal + newTax + newShipping;
    setCartTotal(newTotal);
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item if it doesn't exist
        return [...prevCart, { ...item, quantity }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTax,
        cartShipping,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);