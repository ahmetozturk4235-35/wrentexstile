import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product: any;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: number, color?: string, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, quantity = 1, color?: string, size?: string) => {
    setItems(prev => {
      const existing = prev.find(item =>
        item.product.id === product.id &&
        item.color === color &&
        item.size === size
      );
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.color === color && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, color, size }];
    });
  };

  const removeFromCart = (productId: number, color?: string, size?: string) => {
    setItems(prev => prev.filter(item =>
      !(item.product.id === productId && item.color === color && item.size === size)
    ));
  };

  const updateQuantity = (productId: number, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    setItems(prev => prev.map(item =>
      item.product.id === productId && item.color === color && item.size === size
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
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
