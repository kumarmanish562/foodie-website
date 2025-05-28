import React, { useState, useEffect } from 'react';
import { FiBox, FiUser, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi'; // Importing icons
import { layoutClasses, tableClasses, statusStyles, paymentMethodDetails } from '../assets/dummyadmin'; // Predefined style and data maps
import axios from 'axios';

// Mapping icons to corresponding components for dynamic rendering
const iconMap = {
  FiCheckCircle: <FiCheckCircle />,
  FiClock: <FiClock />,
  FiXCircle: <FiXCircle />,
  FiAlertCircle: <FiAlertCircle />,
};

const Order = () => {
  const [orders, setOrders] = useState([]); // Stores all fetched orders
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          'http://localhost:4000/api/orders/getall',
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );

        // Format the order data for UI rendering
        const formatted = response.data.map(order => ({
          ...order,
          address: order.address ?? order.shippingAddress?.address ?? '',
          city: order.city ?? order.shippingAddress?.city ?? '',
          zipCode: order.zipCode ?? order.shippingAddress?.zipCode ?? '',
          phone: order.phone ?? '',
          items: order.items?.map(e => ({
            _id: e._id,
            item: e.item,
            quantity: e.quantity
          })) || [],
          createdAt: new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          }),
        }));

        setOrders(formatted); // Set the formatted orders
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders.'); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchOrders();
  }, []);

  // Handles status change of an order
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/orders/getall/${orderId}`, {
        status: newStatus
      });

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Show loading state
  if (loading) return (
    <div className={layoutClasses.page + ' flex items-center justify-center'}>
      <div className='text-green-400 text-xl'>Loading orders....</div>
    </div>
  );

  // Show error state
  if (error) return (
    <div className={layoutClasses.page + ' flex items-center justify-center'}>
      <div className='text-red-400 text-xl'>{error}</div>
    </div>
  );

  // Main JSX return
  return (
    <div className={layoutClasses.page}>
      <div className='mx-auto max-w-7xl'>
        <div className={layoutClasses.card}>
          <h2 className={layoutClasses.heading}>Order Management</h2>

          {/* Table layout */}
          <div className={tableClasses.wrapper}>
            <table className={tableClasses.table}>
              <thead className={tableClasses.headerRow}>
                <tr>
                  {/* Table headers */}
                  {['Order ID', 'Customer', 'Address', 'Items', 'Total Items', 'Price', 'Payment', 'Status'].map(h => (
                    <th key={h} className={tableClasses.headerCell + (h === 'Total Items' ? ' text-center' : '')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table body with order data */}
              <tbody>
                {orders.map(order => {
                  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0); // Total quantity of items
                  const totalPrice = order.total ?? order.items.reduce((s, i) => s + i.item.price * i.quantity, 0); // Total price
                  const payMethod = paymentMethodDetails[order.paymentMethod?.toLowerCase()] || paymentMethodDetails.default; // Payment method details
                  const payStatusStyle = statusStyles[order.paymentStatus] || statusStyles.processing; // Payment status style
                  const stat = statusStyles[order.status] || statusStyles.processing; // Order status style

                  return (
                    <tr key={order._id} className={tableClasses.row}>
                      {/* Order ID */}
                      <td className={tableClasses.cellBase + ' font-mono text-sm text-amber-100'}>
                        #{order._id.slice(-8)}
                      </td>

                      {/* Customer Details */}
                      <td className={tableClasses.cellBase}>
                        <div className='flex items-center gap-2'>
                          <FiUser className='text-green-400' />
                          <div>
                            <p className='text-green-100'>{order.user?.name || order.name}</p>
                            <p className='text-green-100'>{order.user?.phone || order.phone}</p>
                            <p className='text-sm text-green-400/60'>{order.user?.email || order.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className={tableClasses.cellBase}>
                        <div className='text-green-100/80 text-sm max-w-[200px]'>
                          {order.address}, {order.city} - {order.zipCode}
                        </div>
                      </td>

                      {/* Ordered Items */}
                      <td className={tableClasses.cellBase}>
                        <div className="space-y-1 max-h-52 overflow-auto">
                          {order.items.map((itm, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg">
                              <img
                                src={`http://localhost:4000${itm.item.imageUrl}`}
                                alt={itm.item.name}
                                className="w-10 h-10 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <span className="text-green-100/80 text-sm block truncate">
                                  {itm.item.name}
                                </span>
                                <div className='flex items-center gap-2 text-xs text-green-400/60'>
                                  <span>₹{itm.item.price.toFixed(2)}</span>
                                  <span>•</span>
                                  <span>x{itm.quantity}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Items */}
                      <td className={tableClasses.cellBase + 'text-center'}>
                        <div className=' flex items-center justify-center gap-1'>
                          <FiBox className=' text-green-400' />
                          <span className=' text-green-300 text-lg0' >{totalItems}</span>
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className={tableClasses.cellBase + 'text-green-300 text-lg'}>
                        ₹{totalPrice.toFixed(2)}
                      </td>

                      {/* Payment Info */}
                      <td className={tableClasses.cellBase}>
                        <div className="flex flex-col gap-2">
                          <div className={`${payMethod.class} px-3 py-1.5 rounded-lg border text-sm`}>
                            {payMethod.label}
                          </div>
                          <div className={`${payStatusStyle.icon} flex items-center gap-2 text-sm`}>
                            {iconMap[payStatusStyle.icon]}
                            <span>{payStatusStyle.lable}</span>
                          </div>
                        </div>
                      </td>

                      {/* Order Status Dropdown */}
                      <td className={tableClasses.cellBase}>
                        <div className='flex items-center gap-2'>
                          <span className={`${stat.color} text-xl`}>
                            {iconMap[stat.icon]}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`px-4 py-2 rounded-lg ${stat.bg} ${stat.color} border border-green-500/20 text-sm cursor-pointer`}
                          >
                            {Object.entries(statusStyles)
                              .filter(([key]) => key !== 'succeeded')
                              .map(([key, sty]) => (
                                <option value={key} key={key}>
                                  {sty.label}
                                </option>
                              ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* No orders fallback */}
          {orders.length === 0 &&
            <div className='text-center py-12 text-green-100/60 text-xl'>
              No orders found
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Order;
