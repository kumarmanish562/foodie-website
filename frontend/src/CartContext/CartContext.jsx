import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper function to calculate total amount
const calculateTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, cartItem) => {
    const price = cartItem?.item?.price || cartItem?.price || 0;
    const quantity = cartItem?.quantity || 0;
    return total + (price * quantity);
  }, 0);
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART': {
      const items = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        cartItems: items,
        totalAmount: calculateTotal(items),
        totalItems: items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
      };
    }
    
    case 'ADD_ITEM': {
      if (!action.payload) return state;
      
      const newItems = [...state.cartItems];
      const existingIndex = newItems.findIndex(item => 
        item?._id === action.payload._id || 
        item?.item?._id === action.payload.item?._id
      );
      
      if (existingIndex > -1) {
        newItems[existingIndex] = action.payload;
      } else {
        newItems.push(action.payload);
      }
      
      return {
        ...state,
        cartItems: newItems,
        totalAmount: calculateTotal(newItems),
        totalItems: newItems.reduce((sum, item) => sum + (item?.quantity || 0), 0)
      };
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.cartItems.filter(item => item?._id !== action.payload);
      return {
        ...state,
        cartItems: filteredItems,
        totalAmount: calculateTotal(filteredItems),
        totalItems: filteredItems.reduce((sum, item) => sum + (item?.quantity || 0), 0)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (!action.payload) return state;
      
      const updatedItems = state.cartItems.map(item =>
        item?._id === action.payload._id ? action.payload : item
      );
      
      return {
        ...state,
        cartItems: updatedItems,
        totalAmount: calculateTotal(updatedItems),
        totalItems: updatedItems.reduce((sum, item) => sum + (item?.quantity || 0), 0)
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
        totalAmount: 0,
        totalItems: 0,
        error: null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    totalAmount: 0,
    totalItems: 0,
    error: null
  });

  // Get auth token with validation
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No authentication token found');
      return null;
    }
    return token;
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!getAuthToken();
  }, [getAuthToken]);

  // Create authenticated axios request
  const createAuthenticatedRequest = useCallback(async (method, url, data = null) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const config = {
        method,
        url: `${API_URL}${url}`,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response;
    } catch (error) {
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error('Authentication failed - removing invalid token');
        localStorage.removeItem('authToken');
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'SET_ERROR', payload: 'Session expired. Please login again.' });
      }
      throw error;
    }
  }, [getAuthToken]);

  // Load cart on mount and when auth changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!isAuthenticated()) {
          console.log('User not authenticated, skipping cart load');
          dispatch({ type: 'CLEAR_CART' });
          return;
        }

        const response = await createAuthenticatedRequest('GET', '/api/cart');
        const cartData = response.data?.cartItems || response.data || [];
        dispatch({ type: 'SET_CART', payload: cartData });
        dispatch({ type: 'CLEAR_ERROR' });
      } catch (error) {
        console.error('Failed to load cart:', error);
        if (error.response?.status !== 401) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
        }
      }
    };

    loadCart();
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Add item to cart
  const addToCart = useCallback(async (item, qty = 1) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to add items to cart');
      }

      if (!item || !item._id) {
        throw new Error('Invalid item data');
      }
      
      if (qty < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const response = await createAuthenticatedRequest('POST', '/api/cart', {
        itemId: item._id,
        quantity: qty
      });
      
      dispatch({ type: 'ADD_ITEM', payload: response.data });
      dispatch({ type: 'CLEAR_ERROR' });
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to add item to cart' });
      throw error;
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Remove item from cart
  const removeFromCart = useCallback(async (_id) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to modify cart');
      }

      if (!_id) {
        throw new Error('Item ID is required');
      }

      await createAuthenticatedRequest('DELETE', `/api/cart/${_id}`);
      dispatch({ type: 'REMOVE_ITEM', payload: _id });
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to remove item from cart' });
      throw error;
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Update quantity of item in cart
  const updateQuantity = useCallback(async (_id, qty) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to modify cart');
      }

      if (!_id) {
        throw new Error('Item ID is required');
      }
      
      if (qty < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const response = await createAuthenticatedRequest('PUT', `/api/cart/${_id}`, {
        quantity: qty
      });
      
      dispatch({ type: 'UPDATE_QUANTITY', payload: response.data });
      dispatch({ type: 'CLEAR_ERROR' });
      return response.data;
    } catch (error) {
      console.error('Failed to update quantity:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update quantity' });
      throw error;
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        dispatch({ type: 'CLEAR_CART' });
        return;
      }

      await createAuthenticatedRequest('DELETE', '/api/cart');
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to clear cart' });
      throw error;
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Helper functions
  const getCartItem = useCallback((_id) => {
    return state.cartItems.find(item => item?._id === _id);
  }, [state.cartItems]);

  const getQuantity = useCallback((_id) => {
    const cartItem = getCartItem(_id);
    return cartItem?.quantity || 0;
  }, [getCartItem]);

  const isInCart = useCallback((_id) => {
    return state.cartItems.some(item => item?._id === _id);
  }, [state.cartItems]);

  const value = {
    // State
    cartItems: state.cartItems,
    totalAmount: state.totalAmount,
    totalItems: state.totalItems,
    error: state.error,
    isAuthenticated: isAuthenticated(),
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Helpers
    getCartItem,
    getQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
