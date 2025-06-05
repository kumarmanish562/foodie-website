import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../CartContext/CartContext';
import { FaMinus, FaPlus, FaTimes, FaTrash, FaExclamationTriangle } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    totalAmount, 
    error, 
    isAuthenticated 
  } = useCart();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLocalError('Please login to view your cart');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [isAuthenticated, navigate]);

  // Build image URL helper function
  const buildImageUrl = (path) => {
    if (!path) return '/fallback-image.jpg';
    return path.startsWith('http') ? path : `${API_URL}/uploads/${path.replace(/^\/uploads\//, '')}`;
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = '/fallback-image.jpg';
  };

  // Handle quantity decrease with loading state
  const handleDecreaseQuantity = async (_id, currentQuantity) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      
      if (currentQuantity > 1) {
        await updateQuantity(_id, currentQuantity - 1);
      } else {
        await removeFromCart(_id);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setLocalError('Failed to update quantity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quantity increase with loading state
  const handleIncreaseQuantity = async (_id, currentQuantity) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await updateQuantity(_id, currentQuantity + 1);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setLocalError('Failed to update quantity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove item with loading state
  const handleRemoveItem = async (_id) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setLocalError(null);
      await removeFromCart(_id);
    } catch (error) {
      console.error('Error removing item:', error);
      setLocalError('Failed to remove item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      setLocalError('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      setLocalError('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  // Show error message component
  const ErrorMessage = ({ message }) => (
    <div className='bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-6 flex items-center gap-3'>
      <FaExclamationTriangle className='text-red-400 text-lg flex-shrink-0' />
      <p className='text-red-400'>{message}</p>
    </div>
  );

  return (
    <div className='min-h-screen overflow-x-hidden py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#041c09] via-[#041c0b] to-[#0a210e]'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-12 animate-fade-in-down'>
          <span className='font-dancingscript block text-5xl sm:text-6xl md:text-7xl mb-2 bg-gradient-to-r from-green-100 to-green-400 bg-clip-text text-transparent'>
            Your Cart
          </span>
        </h1>

        {/* Error Messages */}
        {(error || localError) && (
          <ErrorMessage message={error || localError} />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-green-900/80 p-6 rounded-lg flex items-center gap-3'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-green-400'></div>
              <span className='text-green-100'>Updating cart...</span>
            </div>
          </div>
        )}

        {!isAuthenticated ? (
          <div className='text-center animate-fade-in'>
            <p className='text-red-400 text-xl mb-4'>Please login to view your cart</p>
            <Link
              to='/login'
              className='bg-green-700/60 px-8 py-3 rounded-full font-cinzel uppercase tracking-wider hover:bg-green-600/70 transition-all duration-300 text-white inline-flex items-center gap-2'
            >
              Go to Login
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className='text-center animate-fade-in'>
            <p className='text-green-100/80 text-xl mb-4'>Your cart is empty</p>
            <Link
              to='/menu'
              className='transition-all duration-300 text-green-100 inline-flex items-center gap-2 hover:gap-3 hover:bg-green-800/50 bg-green-900/40 px-6 py-2 rounded-full font-cinzel text-sm uppercase'
            >
              Browse All Items
            </Link>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {cartItems.map(({ _id, item, quantity }) => (
                <div
                  key={_id}
                  className='group bg-green-900/20 p-4 rounded-2xl border-4 border-dashed border-green-500 backdrop-blur-sm flex flex-col items-center gap-4 transition-all duration-300 hover:border-solid hover:shadow-xl hover:shadow-green-900/10 transform hover:-translate-y-1 animate-fade-in'
                >
                  <div
                    className='w-24 h-24 flex-shrink-0 cursor-pointer relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105'
                    onClick={() => setSelectedImage(buildImageUrl(item.imageUrl || item.image))}
                  >
                    <img 
                      src={buildImageUrl(item.imageUrl || item.image)} 
                      alt={item.name} 
                      className='w-full h-full object-contain'
                      onError={handleImageError}
                    />
                  </div>

                  <div className='w-full text-center'>
                    <h3 className='text-xl font-dancingscript text-green-100'>
                      {item.name}
                    </h3>
                    <p className='text-green-100/80 font-cinzel mt-1'>
                      ₹{Number(item.price).toFixed(2)}
                    </p>
                  </div>

                  <div className='flex items-center gap-3'>
                    <button 
                      onClick={() => handleDecreaseQuantity(_id, quantity)}
                      disabled={isLoading}
                      className='w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                      aria-label="Decrease quantity"
                    >
                      <FaMinus className='w-3 h-3 text-green-100' />
                    </button>
                    
                    <span className='w-8 text-center text-green-100 font-cinzel'>
                      {quantity}
                    </span>
                    
                    <button 
                      onClick={() => handleIncreaseQuantity(_id, quantity)}
                      disabled={isLoading}
                      className='w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                      aria-label="Increase quantity"
                    >
                      <FaPlus className='w-3 h-3 text-green-100' />
                    </button>
                  </div>

                  <div className='flex items-center justify-between w-full'>
                    <button 
                      onClick={() => handleRemoveItem(_id)}
                      disabled={isLoading}
                      className='bg-red-900/40 px-3 py-1 rounded-full font-cinzel text-xs uppercase transition-all duration-300 hover:bg-red-800/50 flex items-center gap-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <FaTrash className='w-3 h-3 text-red-100' />
                      <span className='text-red-100'>
                        Remove
                      </span>
                    </button>
                    
                    <p className='text-sm font-dancingscript text-green-300'>
                      ₹{Number(item.price * quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-12 pt-8 border-t border-green-800/30 animate-fade-in-up'>
              <div className='flex flex-col sm:flex-row justify-between items-center gap-8'>
                <Link 
                  to='/menu' 
                  className='bg-green-900/40 px-8 py-3 rounded-full font-cinzel uppercase tracking-wider hover:bg-green-800/50 transition-all duration-300 text-green-100 inline-flex items-center gap-2 hover:gap-3 active:scale-95'
                >
                  Continue Food Order
                </Link>
                
                <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-8'>
                  <h2 className='text-3xl font-dancingscript text-green-100'>
                    Total: ₹{Number(totalAmount).toFixed(2)}
                  </h2>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || !isAuthenticated || cartItems.length === 0}
                    className='bg-green-700/60 px-8 py-3 rounded-full font-cinzel uppercase tracking-wider hover:bg-green-600/70 transition-all duration-300 text-white flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Checkout Now
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-auto' 
          onClick={() => setSelectedImage(null)}
        >
          <div className='relative max-w-full max-h-full' onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Full View" 
              className='max-w-[90vw] max-h-[90vh] rounded-lg'
              onError={handleImageError}
            />
            <button 
              onClick={() => setSelectedImage(null)} 
              className='absolute top-2 right-2 bg-red-600/80 rounded-full p-2 text-white hover:bg-red-500/90 transition-transform duration-200 active:scale-90'
              aria-label="Close image"
            >
              <FaTimes className='w-6 h-6' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;