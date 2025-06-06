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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    error: cartError
  } = useCart();

  // Fetch Menu Items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/items`);
        const data = response.data?.items || response.data?.item || response.data || [];
        
        const validItems = Array.isArray(data) ? data.filter(item => item && item._id) : [];
        setItems(validItems);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load special offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [API_BASE_URL]);

  const displayList = items.slice(0, showAll ? 8 : 4);

  // Get cart quantity for an item
  const getItemQuantity = useCallback((itemId) => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    
    const cartItem = cartItems.find(ci => {
      const cartItemId = ci._id || ci.item?._id || ci.itemId;
      return cartItemId === itemId;
    });
    
    return cartItem?.quantity || 0;
  }, [cartItems]);

  // Get cart entry for an item
  const getCartEntry = useCallback((itemId) => {
    if (!cartItems || !Array.isArray(cartItems)) return null;
    
    return cartItems.find(ci => {
      const cartItemId = ci._id || ci.item?._id || ci.itemId;
      return cartItemId === itemId;
    });
  }, [cartItems]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (item) => {
    if (!item || !item._id || addingItems.has(item._id)) return;
    
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
      }, 300);
    }
  }, [addToCart, addingItems]);

  // Handle quantity increase
  const handleIncreaseQuantity = useCallback(async (itemId) => {
    const cartEntry = getCartEntry(itemId);
    if (!cartEntry) return;

    const currentQuantity = getItemQuantity(itemId);
    
    try {
      await updateQuantity(cartEntry._id, currentQuantity + 1);
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  }, [getCartEntry, getItemQuantity, updateQuantity]);

  // Handle quantity decrease
  const handleDecreaseQuantity = useCallback(async (itemId) => {
    const cartEntry = getCartEntry(itemId);
    if (!cartEntry) return;

    const currentQuantity = getItemQuantity(itemId);
    
    try {
      if (currentQuantity > 1) {
        await updateQuantity(cartEntry._id, currentQuantity - 1);
      } else {
        await removeFromCart(cartEntry._id);
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  }, [getCartEntry, getItemQuantity, updateQuantity, removeFromCart]);

  // Build image URL
  const buildImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '/fallback-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}/uploads/${imagePath.replace(/^\/uploads\//, '')}`;
  }, [API_BASE_URL]);

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
          <p className='text-lg text-gray-300 max-w-3xl mx-auto tracking-wide leading-relaxed'>
            Savor the extraordinary with our culinary masterpieces crafted to perfection.
          </p>
        </div>

        {/* Error Messages */}
        {(error || cartError) && (
          <div className='text-center py-8'>
            <p className='text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg p-4 inline-block'>
              {error || cartError}
            </p>
          </div>
        )}

        {loading && (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400'></div>
            <p className='text-green-300 mt-2'>Loading special offers...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-400 text-lg'>No special offers available at the moment.</p>
              </div>
            ) : (
              <>
                {/* Product grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
                  {displayList.map((item) => {
                    const qty = getItemQuantity(item._id);
                    const isAdding = addingItems.has(item._id);

                    return (
                      <div 
                        key={item._id} 
                        className="relative group bg-[#0b2012] rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-4 transition-all duration-500 hover:shadow-green-900/40 border-2 border-transparent hover:border-green-500/20"
                      >
                        {/* Product Image */}
                        <div className='relative h-72 overflow-hidden'>
                          <img 
                            src={buildImageUrl(item.imageUrl || item.image)} 
                            alt={item.name || 'Food item'} 
                            className='w-full h-full object-cover brightness-90 group-hover:brightness-110 transition-all duration-500'
                            onError={handleImageError}
                          />
                          <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50' />
                          <div className='absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full'>
                            <span className="flex items-center gap-2 text-green-400">
                              <FaStar className="text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />
                              <span className="font-bold text-sm">{item.rating || '4.5'}</span>
                            </span>
                            <span className="flex items-center gap-2 text-green-400">
                              <FaHeart className="text-lg" />
                              <span className="font-bold text-sm">{item.hearts || '120'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Product Content */}
                        <div className='p-6 relative z-10'>
                          <h3 className='text-xl font-bold mb-2 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent font-[Playfair_Display]'>
                            {item.name || 'Unnamed Item'}
                          </h3>
                          <p className='text-gray-300 mb-4 text-sm leading-relaxed line-clamp-2'>
                            {item.description || 'Delicious food item'}
                          </p>
                          
                          <div className='flex items-center justify-between gap-4'>
                            <span className='text-2xl font-bold text-green-400'>
                              ₹{Number(item.price || 0).toFixed(2)}
                            </span>

                            {/* Cart Controls - Matching your desired design */}
                            {qty > 0 ? (
                              <div className='flex items-center gap-2 bg-[#0b2012] rounded-lg px-1 py-1 border border-green-500/30'>
                                {/* Minus Button */}
                                <button
                                  onClick={() => handleDecreaseQuantity(item._id)}
                                  disabled={isAdding}
                                  className='w-10 h-10 rounded-lg bg-green-800/60 flex items-center justify-center hover:bg-green-700/80 transition-all duration-200 active:scale-95 disabled:opacity-50'
                                  aria-label="Decrease quantity"
                                >
                                  <HiMinus className='w-5 h-5 text-white font-bold' />
                                </button>
                                
                                {/* Quantity Display */}
                                <div className='w-12 h-10 flex items-center justify-center bg-transparent'>
                                  <span className='text-green-100 font-bold text-lg'>
                                    {qty}
                                  </span>
                                </div>
                                
                                {/* Plus Button */}
                                <button
                                  onClick={() => handleIncreaseQuantity(item._id)}
                                  disabled={isAdding}
                                  className='w-10 h-10 rounded-lg bg-green-800/60 flex items-center justify-center hover:bg-green-700/80 transition-all duration-200 active:scale-95 disabled:opacity-50'
                                  aria-label="Increase quantity"
                                >
                                  <HiPlus className='w-5 h-5 text-white font-bold' />
                                </button>
                              </div>
                            ) : (
                              /* Add Button */
                              <button
                                onClick={() => handleAddToCart(item)}
                                disabled={isAdding}
                                className="px-6 py-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-500 hover:to-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
                                aria-label={`Add ${item.name} to cart`}
                              >
                                <FaPlus className="text-sm" />
                                <span>
                                  {isAdding ? 'Adding...' : 'Add'}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Hover Effects */}
                        <div className='absolute inset-0 rounded-3xl pointer-events-none border-2 border-transparent group-hover:border-green-500/30 transition-all duration-500' />
                        <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
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
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialOffer;