'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type MenuItem } from '@/lib/db';

export interface CartItem {
  id: string; // combining itemId-size-color
  menuItem: MenuItem;
  quantity: number;
  selectedSize: string | null;
  selectedColor: string | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem, quantity: number, size: string | null, color: string | null) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    const savedCart = localStorage.getItem('g_glass_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
      }
    }
    setIsMounted(true);
  }, []);

  // Save cart to localStorage when it changes, but only after mounting
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('g_glass_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (item: MenuItem, quantity: number, size: string | null, color: string | null) => {
    const variationId = `${item.id}-${size || 'default'}-${color || 'default'}`;
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((i) => i.id === variationId);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [
          ...prevItems,
          {
            id: variationId,
            menuItem: item,
            quantity,
            selectedSize: size,
            selectedColor: color,
          },
        ];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        isMounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
