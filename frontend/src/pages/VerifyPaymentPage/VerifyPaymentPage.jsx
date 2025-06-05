import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../CartContext/CartContext';
import axios from 'axios';

const VerifyPaymentPage = () => {

  const { clearCart } = useCart();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [statusMsg, setStatusMsg] = useState('Verifying payment...');
  //grab token

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const params = new URLSearchParams(search);
    const success = params.get("success");
    const session_id = params.get("session_id");

    // Missing and cancelled
    if (success === 'false') {
      navigate('/checkout', { replace: true });
      return;
    }

    if (!session_id) {
      setStatusMsg('Order failed. No session ID found.');
      return;
    }

    // stripe success
    axios.get('http://localhost:4000/api/orders/confirm', {
      params: { session_id },
      headers: authHeaders
    })
      .then(() => {
        clearCart();
        navigate("/myorders", { replace: true });
      })
      .catch(err => {
        console.error("Payment confirmation failed", err);
        setStatusMsg("Payment confirmation failed. Please contact support.");
        clearCart(false);
      });
  }, [search, clearCart, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <p>{statusMsg}</p>
    </div>
  )
}

export default VerifyPaymentPage