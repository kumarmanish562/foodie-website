import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper function to calculate total amount with better error handling
const calculateTotal = (items) => {
  if (!Array.isArray(items)) {
    console.warn('calculateTotal: items is not an array:', items);
    return 0;
  }
  
  return items.reduce((total, cartItem) => {
    if (!cartItem) {
      console.warn('calculateTotal: null cart item found');
      return total;
    }
    
    const price = Number(cartItem?.item?.price || cartItem?.price || 0);
    const quantity = Number(cartItem?.quantity || 0);
    
    // Validate numbers
    if (isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
      console.warn('Invalid price or quantity found:', { price, quantity, cartItem });
      return total;
    }
    
    return total + (price * quantity);
  }, 0);
};

// Helper function to calculate total items
const calculateTotalItems = (items) => {
  if (!Array.isArray(items)) {
    console.warn('calculateTotalItems: items is not an array:', items);
    return 0;
  }
  
  return items.reduce((sum, item) => {
    const quantity = Number(item?.quantity || 0);
    return sum + (isNaN(quantity) ? 0 : quantity);
  }, 0);
};

const cartReducer = (state, action) => {
  console.log('CartReducer - Action:', action.type, action.payload);
  
  try {
    switch (action.type) {
      case 'SET_CART': {
        const items = Array.isArray(action.payload) ? action.payload : [];
        // Filter out invalid items
        const validItems = items.filter(item => {
          const isValid = item && (item._id || item.id);
          if (!isValid) {
            console.warn('SET_CART: Invalid item filtered out:', item);
          }
          return isValid;
        });
        
        console.log('SET_CART: Valid items:', validItems.length);
        
        return {
          ...state,
          cartItems: validItems,
          totalAmount: calculateTotal(validItems),
          totalItems: calculateTotalItems(validItems),
          error: null
        };
      }
      
      case 'ADD_ITEM': {
        if (!action.payload || !action.payload._id) {
          console.warn('Invalid item payload for ADD_ITEM:', action.payload);
          return {
            ...state,
            error: 'Invalid item data received'
          };
        }
        
        const newItems = [...state.cartItems];
        const existingIndex = newItems.findIndex(item => {
          const itemId = item?._id || item?.id;
          const payloadId = action.payload._id || action.payload.id;
          const itemMenuId = item?.item?._id || item?.itemId;
          const payloadMenuId = action.payload.item?._id || action.payload.itemId;
          
          return itemId === payloadId || itemMenuId === payloadMenuId;
        });
        
        if (existingIndex > -1) {
          newItems[existingIndex] = { ...newItems[existingIndex], ...action.payload };
          console.log('ADD_ITEM: Updated existing item at index:', existingIndex);
        } else {
          newItems.push(action.payload);
          console.log('ADD_ITEM: Added new item');
        }
        
        return {
          ...state,
          cartItems: newItems,
          totalAmount: calculateTotal(newItems),
          totalItems: calculateTotalItems(newItems),
          error: null
        };
      }
      
      case 'REMOVE_ITEM': {
        if (!action.payload) {
          console.warn('REMOVE_ITEM: No payload provided');
          return state;
        }
        
        const filteredItems = state.cartItems.filter(item => {
          const itemId = item?._id || item?.id;
          return itemId !== action.payload;
        });
        
        console.log('REMOVE_ITEM: Filtered items:', filteredItems.length);
        
        return {
          ...state,
          cartItems: filteredItems,
          totalAmount: calculateTotal(filteredItems),
          totalItems: calculateTotalItems(filteredItems),
          error: null
        };
      }
      
      case 'UPDATE_QUANTITY': {
        if (!action.payload || !action.payload._id) {
          console.warn('Invalid payload for UPDATE_QUANTITY:', action.payload);
          return {
            ...state,
            error: 'Invalid update data received'
          };
        }
        
        const updatedItems = state.cartItems.map(item => {
          const itemId = item?._id || item?.id;
          const payloadId = action.payload._id || action.payload.id;
          
          return itemId === payloadId ? { ...item, ...action.payload } : item;
        });
        
        console.log('UPDATE_QUANTITY: Updated items');
        
        return {
          ...state,
          cartItems: updatedItems,
          totalAmount: calculateTotal(updatedItems),
          totalItems: calculateTotalItems(updatedItems),
          error: null
        };
      }
      
      case 'CLEAR_CART':
        console.log('CLEAR_CART: Clearing cart');
        return {
          ...state,
          cartItems: [],
          totalAmount: 0,
          totalItems: 0,
          error: null
        };
      
      case 'SET_ERROR':
        console.log('SET_ERROR:', action.payload);
        return {
          ...state,
          error: action.payload
        };
      
      case 'CLEAR_ERROR':
        console.log('CLEAR_ERROR');
        return {
          ...state,
          error: null
        };
      
      case 'SET_LOADING':
        console.log('SET_LOADING:', action.payload);
        return {
          ...state,
          isLoading: action.payload
        };
      
      default:
        console.warn('Unknown action type:', action.type);
        return state;
    }
  } catch (error) {
    console.error('CartReducer error:', error);
    return {
      ...state,
      error: `Cart operation failed: ${error.message}`
    };
  }
};

export const CartProvider = ({ children }) => {
  console.log('CartProvider: Initializing');
  
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    totalAmount: 0,
    totalItems: 0,
    error: null,
    isLoading: false
  });

  // Memoize auth token getter for better performance
  const getAuthToken = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || token === 'null' || token === 'undefined') {
        console.log('getAuthToken: No valid token found');
        return null;
      }
      const trimmedToken = token.trim();
      console.log('getAuthToken: Token found, length:', trimmedToken.length);
      return trimmedToken;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = getAuthToken();
    const authenticated = !!(token && token.length > 0);
    console.log('isAuthenticated:', authenticated);
    return authenticated;
  }, [getAuthToken]);

  // Create authenticated axios request with better error handling
  const createAuthenticatedRequest = useCallback(async (method, url, data = null) => {
    console.log(`createAuthenticatedRequest: ${method} ${url}`);
    
    const token = getAuthToken();
    if (!token) {
      const error = new Error('Authentication required. Please login first.');
      console.error('createAuthenticatedRequest: No token available');
      throw error;
    }

    try {
      const config = {
        method,
        url: `${API_URL}${url}`,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // Increased timeout to 15 seconds
      };

      if (data) {
        config.data = data;
      }

      console.log('createAuthenticatedRequest: Making request to:', config.url);
      const response = await axios(config);
      console.log('createAuthenticatedRequest: Success:', response.status);
      return response;
    } catch (error) {
      console.error('createAuthenticatedRequest: Error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication failed - removing invalid token');
        localStorage.removeItem('authToken');
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'SET_ERROR', payload: 'Session expired. Please login again.' });
      } else if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
        dispatch({ type: 'SET_ERROR', payload: 'Request timeout. Please try again.' });
      } else if (!error.response) {
        console.error('Network error');
        dispatch({ type: 'SET_ERROR', payload: 'Network error. Please check your connection.' });
      } else {
        console.error('Server error:', error.response?.status, error.response?.data);
        dispatch({ type: 'SET_ERROR', payload: `Server error: ${error.response?.status}` });
      }
      throw error;
    }
  }, [getAuthToken]);

  // Load cart on mount and when auth changes
  useEffect(() => {
    console.log('CartProvider: useEffect triggered');
    let isMounted = true;
    
    const loadCart = async () => {
      try {
        console.log('loadCart: Starting...');
        
        if (!isAuthenticated()) {
          console.log('User not authenticated, clearing cart');
          dispatch({ type: 'CLEAR_CART' });
          return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        
        console.log('loadCart: Fetching cart data...');
        const response = await createAuthenticatedRequest('GET', '/api/cart');
        
        if (isMounted) {
          const cartData = response.data?.cartItems || response.data || [];
          console.log('loadCart: Received cart data:', cartData);
          dispatch({ type: 'SET_CART', payload: cartData });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load cart:', error);
          if (error.response?.status !== 401 && error.response?.status !== 403) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart. Please refresh the page.' });
          }
        }
      } finally {
        if (isMounted) {
          console.log('loadCart: Setting loading to false');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadCart();

    return () => {
      console.log('loadCart: Cleanup');
      isMounted = false;
    };
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Add item to cart with optimistic updates
  const addToCart = useCallback(async (item, qty = 1) => {
    console.log('addToCart: Starting...', item, qty);
    
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to add items to cart');
      }

      if (!item || !item._id) {
        throw new Error('Invalid item data');
      }
      
      const quantity = Number(qty);
      if (isNaN(quantity) || quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await createAuthenticatedRequest('POST', '/api/cart', {
        itemId: item._id,
        quantity: quantity
      });
      
      console.log('addToCart: Success, dispatching ADD_ITEM');
      dispatch({ type: 'ADD_ITEM', payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to add item to cart' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Remove item from cart
  const removeFromCart = useCallback(async (_id) => {
    console.log('removeFromCart: Starting...', _id);
    
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to modify cart');
      }

      if (!_id) {
        throw new Error('Item ID is required');
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await createAuthenticatedRequest('DELETE', `/api/cart/${_id}`);
      console.log('removeFromCart: Success, dispatching REMOVE_ITEM');
      dispatch({ type: 'REMOVE_ITEM', payload: _id });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to remove item from cart' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Update quantity of item in cart
  const updateQuantity = useCallback(async (_id, qty) => {
    console.log('updateQuantity: Starting...', _id, qty);
    
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to modify cart');
      }

      if (!_id) {
        throw new Error('Item ID is required');
      }
      
      const quantity = Number(qty);
      if (isNaN(quantity) || quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await createAuthenticatedRequest('PUT', `/api/cart/${_id}`, {
        quantity: quantity
      });
      
      console.log('updateQuantity: Success, dispatching UPDATE_QUANTITY');
      dispatch({ type: 'UPDATE_QUANTITY', payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Failed to update quantity:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update quantity' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Clear cart
  const clearCart = useCallback(async () => {
    console.log('clearCart: Starting...');
    
    try {
      if (!isAuthenticated()) {
        dispatch({ type: 'CLEAR_CART' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      await createAuthenticatedRequest('DELETE', '/api/cart');
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to clear cart' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, createAuthenticatedRequest]);

  // Helper functions with better item ID matching
  const getCartItem = useCallback((itemId) => {
    if (!itemId) return null;
    
    const item = state.cartItems.find(item => {
      const cartItemId = item?._id || item?.id;
      const menuItemId = item?.item?._id || item?.itemId;
      
      return cartItemId === itemId || menuItemId === itemId;
    });
    
    console.log('getCartItem:', itemId, '→', item ? 'found' : 'not found');
    return item;
  }, [state.cartItems]);

  const getQuantity = useCallback((itemId) => {
    const cartItem = getCartItem(itemId);
    const quantity = Number(cartItem?.quantity || 0);
    const result = isNaN(quantity) ? 0 : quantity;
    console.log('getQuantity:', itemId, '→', result);
    return result;
  }, [getCartItem]);

  const isInCart = useCallback((itemId) => {
    const result = !!getCartItem(itemId);
    console.log('isInCart:', itemId, '→', result);
    return result;
  }, [getCartItem]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    console.log('CartProvider: Creating context value');
    return {
      // State
      cartItems: state.cartItems,
      totalAmount: state.totalAmount,
      totalItems: state.totalItems,
      error: state.error,
      isLoading: state.isLoading,
      isAuthenticated: isAuthenticated(),
      
      // Actions
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      clearError,
      
      // Helpers
      getCartItem,
      getQuantity,
      isInCart
    };
  }, [
    state.cartItems,
    state.totalAmount,
    state.totalItems,
    state.error,
    state.isLoading,
    isAuthenticated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,
    getCartItem,
    getQuantity,
    isInCart
  ]);

  console.log('CartProvider: Rendering with state:', {
    cartItemsCount: state.cartItems.length,
    totalAmount: state.totalAmount,
    totalItems: state.totalItems,
    error: state.error,
    isLoading: state.isLoading
  });

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