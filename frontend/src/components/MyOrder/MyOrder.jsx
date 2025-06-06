import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiClock, FiTruck, FiCheckCircle, FiUser, FiMapPin, FiBox, FiRefreshCw } from 'react-icons/fi';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Safe user data extraction with error handling
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'null' || userData === 'undefined') {
        console.warn('No user data found in localStorage');
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }, []);

  // Safe token retrieval
  const getAuthToken = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || token === 'null' || token === 'undefined') {
        console.warn('No auth token found');
        return null;
      }
      return token.trim();
    } catch (error) {
      console.error('Error accessing auth token:', error);
      return null;
    }
  }, []);

  // Enhanced error handling for API requests
  const createAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login to view your orders.');
    }

    const config = {
      timeout: 15000, // 15 second timeout
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log('Making request to:', url);
      const response = await axios.get(url, config);
      console.log('Request successful:', response.status);
      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication failed - clearing tokens');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection and try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.response?.data?.message || `Server error: ${error.response?.status}`);
      }
    }
  }, [getAuthToken]);

  // Enhanced order data formatting with better error handling
  const formatOrderData = useCallback((orderData) => {
    if (!orderData || !Array.isArray(orderData)) {
      console.warn('Invalid order data received:', orderData);
      return [];
    }

    return orderData.map(order => {
      try {
        // Ensure order has required fields
        if (!order._id) {
          console.warn('Order missing _id:', order);
          return null;
        }

        // Format items with safe property access
        const formattedItems = (order.items || []).map(entry => {
          if (!entry) return null;

          return {
            _id: entry._id || entry.itemId || `temp-${Math.random()}`,
            item: {
              name: entry.name || entry.item?.name || 'Unknown Item',
              price: Number(entry.price || entry.item?.price || 0),
              imageUrl: entry.item?.imageUrl || entry.imageUrl || null
            },
            quantity: Number(entry.quantity || 1)
          };
        }).filter(Boolean); // Remove null entries

        // Format date safely
        let formattedDate;
        try {
          formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (dateError) {
          console.warn('Error formatting date for order:', order._id, dateError);
          formattedDate = 'Date unavailable';
        }

        return {
          ...order,
          items: formattedItems,
          createdAt: formattedDate,
          paymentStatus: (order.paymentStatus || 'pending').toLowerCase(),
          status: (order.status || 'pending').toLowerCase(),
          totalAmount: Number(order.totalAmount || order.total || 0)
        };
      } catch (formatError) {
        console.error('Error formatting order:', order._id, formatError);
        return null;
      }
    }).filter(Boolean); // Remove null entries
  }, []);

  // Fetch orders with enhanced error handling
  const fetchOrders = useCallback(async () => {
    try {
      console.log('Fetching orders...');
      setError(null);
      setLoading(true);

      // Check authentication first
      const token = getAuthToken();
      if (!token) {
        setError('Please login to view your orders');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      const response = await createAuthenticatedRequest(`${API_URL}/api/orders`);
      
      // Handle response data structure
      const ordersData = response.data?.orders || response.data || [];
      console.log('Raw orders data:', ordersData);
      
      // Format orders data
      const formattedOrders = formatOrderData(ordersData);
      console.log('Formatted orders:', formattedOrders);
      
      setOrders(formattedOrders);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      
      // Auto-retry logic for network errors (max 3 attempts)
      if (retryCount < 3 && err.message.includes('Network error')) {
        console.log(`Auto-retry attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchOrders(), 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, createAuthenticatedRequest, formatOrderData, navigate, retryCount]);

  // Effect to fetch orders
  useEffect(() => {
    console.log('MyOrder component mounted');
    fetchOrders();
  }, []); // Remove user dependency to prevent unnecessary re-fetches

  // Memoized status styles
  const statusStyles = useMemo(() => ({
    processing: {
      color: 'text-amber-400',
      bg: 'bg-amber-900/20',
      icon: <FiClock className="text-lg" />,
      label: 'Processing'
    },
    preparing: {
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      icon: <FiClock className="text-lg" />,
      label: 'Preparing'
    },
    confirmed: {
      color: 'text-green-400',
      bg: 'bg-green-900/20',
      icon: <FiCheckCircle className="text-lg" />,
      label: 'Confirmed'
    },
    outfordelivery: {
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      icon: <FiTruck className="text-lg" />,
      label: 'Out for Delivery'
    },
    delivered: {
      color: 'text-green-400',
      bg: 'bg-green-900/20',
      icon: <FiCheckCircle className="text-lg" />,
      label: 'Delivered'
    },
    pending: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
      icon: <FiClock className="text-lg" />,
      label: 'Pending'
    },
    cancelled: {
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      icon: <FiArrowLeft className="text-lg" />,
      label: 'Cancelled'
    }
  }), []);

  // Enhanced payment method details
  const getPaymentMethodDetails = useCallback((method) => {
    const methodLower = method?.toLowerCase() || '';
    
    switch (methodLower) {
      case 'cash':
      case 'cod':
        return {
          label: 'Cash on Delivery',
          class: 'bg-yellow-600/30 text-yellow-300 border-yellow-500/50'
        };
      case 'card':
      case 'debit':
      case 'credit':
        return {
          label: 'Credit/Debit Card',
          class: 'bg-blue-600/30 text-blue-300 border-blue-500/50'
        };
      case 'upi':
        return {
          label: 'UPI Payment',
          class: 'bg-purple-600/30 text-purple-300 border-purple-500/50'
        };
      case 'online':
      case 'razorpay':
      case 'stripe':
        return {
          label: 'Online Payment',
          class: 'bg-green-600/30 text-green-400 border-green-500/50'
        };
      default:
        return {
          label: method || 'Unknown',
          class: 'bg-gray-600/30 text-gray-400 border-gray-500/50'
        };
    }
  }, []);

  // Enhanced image URL builder
  const buildImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '/fallback-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove /api from API_URL for image paths
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}/uploads/${imagePath.replace(/^\/uploads\//, '')}`;
  }, []);

  // Handle image load error
  const handleImageError = useCallback((e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/fallback-image.jpg';
  }, []);

  // Manual retry function
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchOrders();
  }, [fetchOrders]);

  // Loading state with better UX
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-[#1a120b] via-[#1a120b] to-[#1a120b] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto mb-4'></div>
          <p className='text-amber-400 text-lg'>Loading your orders...</p>
          {retryCount > 0 && (
            <p className='text-amber-400/70 text-sm mt-2'>Retry attempt {retryCount}/3</p>
          )}
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-[#1a120b] via-[#1a120b] to-[#1a120b] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='text-center max-w-md mx-auto'>
          <div className='bg-red-900/20 border border-red-800/30 rounded-lg p-6 mb-6'>
            <FaExclamationTriangle className='text-red-400 text-4xl mx-auto mb-4' />
            <p className='text-red-400 text-xl mb-4'>{error}</p>
            
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button 
                onClick={handleRetry}
                className='bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2'
              >
                <FiRefreshCw className='text-lg' />
                <span>Retry</span>
              </button>
              
              <Link 
                to='/'
                className='bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2'
              >
                <FiArrowLeft className='text-lg' />
                <span>Go Home</span>
              </Link>
            </div>
            
            {error.includes('login') && (
              <Link 
                to='/login'
                className='mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
              >
                Go to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#1a120b] via-[#1a120b] to-[#1a120b] py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
          <Link 
            to='/' 
            className='flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors'
          >
            <FaArrowLeft className='text-2xl' />
            <span className='text-lg font-semibold'>Back to Home</span>
          </Link>
          
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
            {user?.email && (
              <span className='text-amber-400/70 text-sm'>
                Logged in as: {user.email}
              </span>
            )}
            <button
              onClick={handleRetry}
              className='flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm'
            >
              <FiRefreshCw className='text-lg' />
              <span>Refresh Orders</span>
            </button>
          </div>
        </div>

        {/* Orders Container */}
        <div className='bg-[#1a120b]/80 backdrop-blur-md shadow-lg rounded-lg border-2 border-amber-200/20 p-6'>
          <div className='flex justify-between items-center mb-8'>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent'>
              Order History
            </h2>
            <span className='text-amber-400/70 text-sm'>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
            </span>
          </div>
          
          {orders.length === 0 ? (
            <div className='text-center py-16'>
              <FiBox className='text-6xl text-amber-400/50 mx-auto mb-4' />
              <h3 className='text-2xl text-amber-100/60 mb-2'>No orders found</h3>
              <p className='text-amber-100/40 mb-6'>You haven't placed any orders yet.</p>
              <Link 
                to='/menu'
                className='bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center gap-2'
              >
                <span>Browse Menu</span>
              </Link>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-amber-900/20'>
                  <tr>
                    <th className="p-4 text-left text-amber-400">Order ID</th>
                    <th className="p-4 text-left text-amber-400">Customer</th>
                    <th className="p-4 text-left text-amber-400">Address</th>
                    <th className="p-4 text-left text-amber-400">Items</th>
                    <th className="p-4 text-left text-amber-400">Total Items</th>
                    <th className="p-4 text-left text-amber-400">Price</th>
                    <th className="p-4 text-left text-amber-400">Payment</th>
                    <th className="p-4 text-left text-amber-400">Status</th>
                    <th className="p-4 text-left text-amber-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                    const totalPrice = order.totalAmount || order.total || order.items.reduce(
                      (sum, item) => sum + ((item.item?.price || 0) * (item.quantity || 0)),
                      0
                    );
                    const paymentMethod = getPaymentMethodDetails(order.paymentMethod);
                    const status = statusStyles[order.status] || statusStyles.pending;

                    return (
                      <tr 
                        key={order._id} 
                        className="border-b border-amber-900/20 hover:bg-amber-900/10 transition-colors duration-200"
                      >
                        <td className="p-4 text-amber-400 font-mono">
                          #{order._id.slice(-8)}
                        </td>
                        
                        <td className='p-4'>
                          <div className='flex items-center gap-2'>
                            <FiUser className='text-amber-400' />
                            <div>
                              <p className='text-amber-400'>
                                {order.customerName || `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'N/A'}
                              </p>
                              <p className='text-amber-400/70 text-sm'>{order.phone || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className='p-4'>
                          <div className='flex items-center gap-2'>
                            <FiMapPin className='text-amber-400' />
                            <div className='text-amber-100/80 text-sm max-w-[200px]'>
                              {order.address || 'N/A'}
                              {order.city && `, ${order.city}`}
                              {order.zipCode && `, ${order.zipCode}`}
                            </div>
                          </div>
                        </td>
                        
                        <td className='p-4'>
                          <div className='space-y-2 max-h-32 overflow-y-auto'>
                            {order.items.map((item, index) => (
                              <div key={`${order._id}-${index}`} className='flex items-center gap-2 rounded-lg'>
                                <img 
                                  src={buildImageUrl(item.item.imageUrl)} 
                                  alt={item.item.name} 
                                  className='w-12 h-12 object-cover rounded-lg'
                                  onError={handleImageError}
                                />
                                <div className='flex-1 min-w-0'>
                                  <span className='text-amber-400 text-sm truncate block'>
                                    {item.item.name}
                                  </span>
                                  <div className='text-amber-100/80 text-xs'>
                                    <span className='text-amber-400'>₹{item.item.price}</span>
                                    <span className='mx-1'>&dot;</span>
                                    <span>x{item.quantity}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className='p-4 text-center'>
                          <div className='flex items-center justify-center gap-1'>
                            <FiBox className='text-amber-400' />
                            <span className='text-amber-400'>{totalItems}</span>
                          </div>
                        </td>
                        
                        <td className='p-4 text-amber-400 font-semibold'>
                          ₹{totalPrice.toFixed(2)}
                        </td>
                        
                        <td className="p-4">
                          <div className={`${paymentMethod.class} px-3 py-1.5 rounded-lg border text-sm text-center`}>
                            {paymentMethod.label}
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-lg ${status.bg} ${status.color} border border-amber-500/50 text-sm flex items-center gap-2 w-fit`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>

                        <td className="p-4 text-amber-400/70 text-sm">
                          {order.createdAt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrder;