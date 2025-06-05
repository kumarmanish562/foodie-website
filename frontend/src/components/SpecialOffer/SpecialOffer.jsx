import React, { useEffect, useState, useCallback } from 'react';
import { useCart } from '../../CartContext/CartContext';
import { FaHeart, FaStar, FaPlus, FaFire } from "react-icons/fa";
import { HiMinus, HiPlus } from "react-icons/hi";
import FloatingParticle from "../FloatingParticle/FloatingParticle";
import axios from 'axios';

const SpecialOffer = () => {
  const [items, setItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingItems, setAddingItems] = useState(new Set());

  // Fixed: Use Vite environment variables instead of process.env
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Fixed: Single useCart hook call
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
  } = useCart();

  // Fetch Menu Items
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/items`)
      .then(res => {
        const data = res.data.item ?? res.data;
        setItems(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching items:', err);
        setError('Failed to load special offers. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_BASE_URL]);

  const displayList = items.slice(0, showAll ? 8 : 4);

  // Fixed: Corrected cart item lookup
  const getCartEntry = useCallback((itemId) => {
    return cartItems.find(ci => ci._id === itemId || ci.id === itemId);
  }, [cartItems]);

  const getQuantity = useCallback((itemId) => {
    const cartEntry = getCartEntry(itemId);
    return cartEntry?.quantity || 0;
  }, [getCartEntry]);

  // Handle add to cart with loading state
  const handleAddToCart = useCallback(async (item) => {
    if (addingItems.has(item._id)) return;
    
    setAddingItems(prev => new Set(prev).add(item._id));
    
    try {
      await addToCart(item, 1);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setTimeout(() => {
        setAddingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item._id);
          return newSet;
        });
      }, 500);
    }
  }, [addToCart, addingItems]);

  // Handle quantity update
  const handleUpdateQuantity = useCallback(async (cartEntry, newQuantity) => {
    try {
      await updateQuantity(cartEntry, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [updateQuantity]);

  // Handle remove from cart
  const handleRemoveFromCart = useCallback(async (cartEntry) => {
    try {
      await removeFromCart(cartEntry);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [removeFromCart]);

  // Image error handler
  const handleImageError = useCallback((e) => {
    e.target.src = '/fallback-image.jpg';
  }, []);

  return (
    <div className='bg-gradient-to-b from-[#02260e] to-[#042c0e] text-white py-16 px-4 font-[Poppins]'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-14'>
          <h1 className='text-5xl font-bold mb-4 transform transition-all bg-gradient-to-r from-green-300 to-red-600 bg-clip-text text-transparent font-[Playfair_Display] italic'>
            Today's <span className='text-stroke-gold'>Special </span>Offer
          </h1>
          <p className='text-lg text-grey-700 max-w-3xl mx-auto tracking-wide leading-relaxed'>
            Savor the extraordinary with our culinary masterpieces crafted to perfection.
          </p>
        </div>

        {loading && (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400'></div>
            <p className='text-green-300 mt-2'>Loading special offers...</p>
          </div>
        )}

        {error && (
          <div className='text-center py-8'>
            <p className='text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg p-4 inline-block'>
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Product grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
              {displayList.map((item) => {
                const cartEntry = getCartEntry(item._id);
                const qty = getQuantity(item._id);
                const isAdding = addingItems.has(item._id);

                return (
                  <div 
                    key={item._id} 
                    className="relative group bg-[#0b2012] rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-4 transition-all duration-500 hover:shadow-green-900/40 border-2 border-transparent hover:border-green-500/20 before:absolute before:inset-0 hover:before:opacity-20"
                  >
                    {/* Product Image */}
                    <div className='relative h-72 overflow-hidden'>
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className='w-full h-full object-cover brightness-90 group-hover:brightness-110 transition-all duration-500'
                        onError={handleImageError}
                      />
                      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90' />
                      <div className='absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full'>
                        <span className="flex items-center gap-2 text-green-400">
                          <FaStar className="text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />
                          <span className="font-bold">{item.rating || '4.5'}</span>
                        </span>
                        <span className="flex items-center gap-2 text-green-400">
                          <FaHeart className="text-xl animate-heartbeat" />
                          <span className="font-bold">{item.hearts || '120'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Product Content */}
                    <div className='p-6 relative z-10'>
                      <h3 className='text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent font-[Playfair_Display] italic'>
                        {item.name}
                      </h3>
                      <p className='text-grey-700 mb-5 text-sm leading-relaxed tracking-wide'>
                        {item.description}
                      </p>
                      <div className='flex items-center justify-between gap-4'>
                        <span className='text-2xl font-bold text-green-400 flex-1'>
                          ₹ {Number(item.price).toFixed(2)}
                        </span>

                        {/* Cart Quantity Controls */}
                        {qty > 0 ? (
                          <div className='flex items-center gap-3'>
                            <button
                              onClick={() => {
                                qty > 1
                                  ? handleUpdateQuantity(cartEntry, qty - 1)
                                  : handleRemoveFromCart(cartEntry);
                              }}
                              disabled={isAdding}
                              className='w-8 h-8 rounded-full bg-green-700/40 flex items-center justify-center hover:bg-green-700/50 transition-all duration-200 active:scale-95 disabled:opacity-50'
                              aria-label="Decrease quantity"
                            >
                              <HiMinus className='w-4 h-4 text-green-300' />
                            </button>
                            <span className='w-8 text-center text-green-100 font-cinzel'>{qty}</span>
                            <button
                              onClick={() => handleUpdateQuantity(cartEntry, qty + 1)}
                              disabled={isAdding}
                              className='w-8 h-8 rounded-full bg-green-700/40 flex items-center justify-center hover:bg-green-700/90 transition-all duration-200 active:scale-95 disabled:opacity-50'
                              aria-label="Increase quantity"
                            >
                              <HiPlus className='w-4 h-4 text-green-300' />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={isAdding}
                            className="relative z-10 px-4 py-2 flex items-center gap-2 rounded-full bg-green-800 text-white font-bold hover:bg-green-600/20 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:hover:bg-green-800"
                            aria-label={`Add ${item.name} to cart`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                            <FaPlus className="text-lg transition-transform" />
                            <span className="relative z-10">
                              {isAdding ? 'Adding...' : 'Add'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Border hover glow */}
                    <div className='absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent group-hover:border-green-500/30 transition-all duration-500' />
                    <div className='opacity-0 group-hover:opacity-100'>
                      <FloatingParticle />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More/Less Button */}
            {items.length > 4 && (
              <div className='mt-12 flex justify-center'>
                <button 
                  onClick={() => setShowAll(!showAll)}
                  className='flex items-center gap-3 bg-gradient-to-r from-green-700 to-red-700 text-white px-8 py-4 rounded-2xl font-bold text-lg uppercase tracking-wider hover:gap-4 hover:scale-105 hover:shadow-green-500/20 transition-all duration-300 group border-2 border-green-400/30 relative overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  <FaFire className='text-xl animate-pulse' />
                  <span>{showAll ? 'Show Less' : 'Show More'}</span>
                  <div className='h-full w-1 bg-green-400/40 absolute right-0 top-0 group-hover:animate-pulse' />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialOffer;