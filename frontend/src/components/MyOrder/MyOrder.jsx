import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiClock, FiTruck, FiCheckCircle, FiUser, FiMapPin, FiBox } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || null;

  // Fetching orders for a user
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Please login to view your orders');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Handle response data structure
        const ordersData = response.data?.orders || response.data || [];
        
        // Format orders data
        const formattedOrders = ordersData.map(order => ({
          ...order,
          items: order.items?.map(entry => ({
            _id: entry._id || entry.itemId,
            item: {
              name: entry.name || entry.item?.name,
              price: entry.price || entry.item?.price,
              imageUrl: entry.item?.imageUrl || entry.imageUrl
            },
            quantity: entry.quantity
          })) || [],
          createdAt: new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          paymentStatus: order.paymentStatus?.toLowerCase() || 'pending'
        }));
        
        setOrders(formattedOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email]);

  const statusStyles = {
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
    outForDelivery: {
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
  };

  const getPaymentMethodDetails = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash':
      case 'cod':
        return {
          label: 'Cash on Delivery',
          class: 'bg-yellow-600/30 text-yellow-300 border-yellow-500/50'
        };
      case 'card':
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
  };

  // Build image URL helper
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/fallback-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}/uploads/${imagePath.replace(/^\/uploads\//, '')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-[#1a120b] via-[#1a120b] to-[#1a120b] flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400'></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-[#1a120b] via-[#1a120b] to-[#1a120b] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <p className='text-red-400 text-xl mb-4'>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 flex items-center gap-2'
          >
            <FiArrowLeft className='text-sm' />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#1a120b] via-[#1a120b] to-[#1a120b] py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <Link to='/' className='flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors'>
            <FaArrowLeft className='text-2xl' />
            <span className='text-lg font-semibold'>Back to Home</span>
          </Link>
          <div className='flex items-center gap-4'>
            <span className='text-amber-400/70 text-sm'>{user?.email}</span>
          </div>
        </div>

        {/* Orders Container */}
        <div className='bg-[#1a120b]/80 backdrop-blur-md shadow-lg rounded-lg border-2 border-amber-200/20 p-6'>
          <h2 className='text-3xl font-bold mb-8 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent'>
            Order History
          </h2>
          
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
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const totalPrice = order.totalAmount || order.total || order.items.reduce(
                    (sum, item) => sum + (item.item.price * item.quantity),
                    0
                  );
                  const paymentMethod = getPaymentMethodDetails(order.paymentMethod);
                  const status = statusStyles[order.status] || statusStyles.pending;

                  return (
                    <tr key={order._id} className="border-b border-amber-900/20 hover:bg-amber-900/10 transition-colors duration-200">
                      <td className="p-4 text-amber-400">
                        #{order._id.slice(-8)}
                      </td>
                      
                      <td className='p-4'>
                        <div className='flex items-center gap-2'>
                          <FiUser className='text-amber-400' />
                          <div>
                            <p className='text-amber-400'>{order.customerName || `${order.firstName} ${order.lastName}`}</p>
                            <p className='text-amber-400/70 text-sm'>{order.phone}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className='p-4'>
                        <div className='flex items-center gap-2'>
                          <FiMapPin className='text-amber-400' />
                          <div className='text-amber-100/80 text-sm max-w-[200px]'>
                            {order.address}
                            {order.city && `, ${order.city}`}
                            {order.zipCode && `, ${order.zipCode}`}
                          </div>
                        </div>
                      </td>
                      
                      <td className='p-4'>
                        <div className='space-y-2'>
                          {order.items.map((item, index) => (
                            <div key={`${order._id}-${index}`} className='flex items-center gap-2 rounded-lg'>
                              <img 
                                src={buildImageUrl(item.item.imageUrl)} 
                                alt={item.item.name} 
                                className='w-12 h-12 object-cover rounded-lg'
                                onError={(e) => {
                                  e.target.src = '/fallback-image.jpg';
                                }}
                              />
                              <div className='flex-1'>
                                <span className='text-amber-400'>{item.item.name}</span>
                                <div className='text-amber-100/80 text-sm'>
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
                        <div className='flex flex-col gap-2'>
                          <div className={`${paymentMethod.class} px-3 py-1.5 rounded-lg border text-sm text-center`}>
                            {paymentMethod.label}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className='flex items-center'>
                          <span className={`px-4 py-2 rounded-lg ${status.bg} ${status.color} border border-amber-500/50 text-sm flex items-center gap-2`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {orders.length === 0 && (
            <div className='text-center py-12 text-amber-100/60 text-xl'>
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrder;