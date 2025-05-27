import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const CartContext = createContext();

// Reducer handling cart actions like add, remove, update quantity
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existingItem = state.find(i => i.id === item.id);
      if (existingItem) {
        return state.map(i =>
          i.id === item.id ? { ...i, quantity } : i
        );
      }
      return [...state, { ...item, quantity }];
    }

    case 'REMOVE_ITEM': {
      return state.filter(i => i.id !== action.payload.itemId);
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, newQuantity } = action.payload;
      return state.map(i =>
        i.id === itemId ? { ...i, quantity: Math.max(1, newQuantity) } : i
      );
    }

    default:
      return state;
  }
};

// Initialize cart from localStorage
const initializer = () => {
  if (typeof window !== 'undefined') {
    const localCart = localStorage.getItem('cart');
    return localCart ? JSON.parse(localCart) : [];
  }
  return [];
};

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [], initializer);

  // Persist cart state to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate total cost and item count
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Format total item count (e.g., 1.2k)
  const formatTotalItems = (num) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
  };

  // Action dispatchers wrapped with useCallback
  const addToCart = useCallback((item, quantity) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  }, []);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, newQuantity } });
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      cartTotal,
      totalItems: formatTotalItems(totalItemsCount)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
