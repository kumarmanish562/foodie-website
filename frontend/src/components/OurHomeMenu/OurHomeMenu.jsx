import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../CartContext/CartContext';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "./OurHomeMenu.css";
import axios from 'axios';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Mexican', 'Italian', 'Desserts', 'Drinks'];

const OurHomeMenu = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingItems, setAddingItems] = useState(new Set()); // Track items being added

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/items`)
      .then(res => {
        if (!res.data || !Array.isArray(res.data)) {
          throw new Error('Invalid response format');
        }
        
        const grouped = res.data.reduce((acc, item) => {
          if (item.category) {
            acc[item.category] = acc[item.category] || [];
            acc[item.category].push(item);
          }
          return acc;
        }, {});
        
        setMenuData(grouped);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu items. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_BASE_URL]);

  // Fixed: Look for both _id and id to handle different cart implementations
  const getCartEntry = useCallback(id => 
    cartItems.find(ci => ci._id === id || ci.id === id), 
    [cartItems]
  );

  const getQuantity = useCallback(id => 
    getCartEntry(id)?.quantity || 0, 
    [getCartEntry]
  );

  const displayItems = (menuData[activeCategory] || []).slice(0, 4);

  // Handle add to cart with loading state
  const handleAddToCart = useCallback(async (item) => {
    if (addingItems.has(item._id)) return; // Prevent multiple clicks
    
    setAddingItems(prev => new Set(prev).add(item._id));
    
    try {
      await addToCart(item, 1);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      // Remove from loading set after a short delay
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
    <div className='bg-gradient-to-br from-[#041702] via-[#071204] to-[#03180e] min-h-screen py-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-br from-green-800/50 via-red-500 to-orange-800'>
          <span className='font-dancingscript block text-5xl md:text-7xl sm:text-6xl mb-2'>
            Our Exquisite Menu.
          </span>
          <span className='block text-xl sm:text-2xl md:text-3xl font-cinzel mt-4 text-green-300/80'>
            A Symphony of Flavours
          </span>
        </h2>

        {loading && (
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400'></div>
            <p className='text-green-300 mt-2'>Loading menu items...</p>
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
            <div className='flex flex-wrap justify-center gap-4 mb-16'>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`px-4 sm:px-6 py-2 rounded-full border-2 transition-all duration-300 transform font-cinzel text-sm sm:text-base tracking-widest backdrop-blur-sm ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-green-700/80 to-green-700/50 border-green-800 scale-105 shadow-xl shadow-green-500/30 text-white'
                      : 'bg-green-900/20 border-green-800/30 text-green-100/90 hover:bg-green-800/40 hover:scale-95'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {displayItems.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-green-300/70'>No items found for this category.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {displayItems.map((item, i) => {
                  const qty = getQuantity(item._id);
                  const cartEntry = getCartEntry(item._id);
                  const isAdding = addingItems.has(item._id);
                  
                  return (
                    <div
                      key={item._id}
                      className='relative bg-green-900/20 rounded-2xl overflow-hidden border border-green-800/30 backdrop-blur-sm flex flex-col transition-all duration-500'
                      style={{ '--index': i }}
                    >
                      <div className='relative h-48 sm:h-56 md:h-60 flex items-center justify-center bg-black/10'>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className='max-h-full max-w-full object-contain transition-all duration-700'
                          onError={handleImageError}
                        />
                      </div>

                      <div className='p-4 sm:p-6 flex flex-col flex-grow'>
                        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-green-800/30 to-transparent opacity-50 transition-all duration-300' />
                        
                        <h3 className='text-xl sm:text-2xl mb-2 font-dancingscript text-orange-100 transition-colors'>
                          {item.name}
                        </h3>
                        
                        <p className='text-green-300/80 text-xs sm:text-sm mb-4 font-cinzel leading-relaxed'>
                          {item.description}
                        </p>

                        <div className='mt-auto flex items-center gap-4 justify-between'>
                          <div className='bg-green-800/10 backdrop-blur-sm px-3 py-1 rounded-2xl shadow-lg'>
                            <span className='text-xl font-bold text-green-100 font-dancingscript'>
                              ₹{item.price}
                            </span>
                          </div>

                          <div className='flex items-center gap-2'>
                            {qty > 0 ? (
                              <>
                                <button
                                  className='w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-colors disabled:opacity-50'
                                  onClick={() =>
                                    qty > 1
                                      ? handleUpdateQuantity(cartEntry, qty - 1)
                                      : handleRemoveFromCart(cartEntry)
                                  }
                                  disabled={isAdding}
                                  aria-label="Decrease quantity"
                                >
                                  <FaMinus className='text-green-100' />
                                </button>
                                <span className='w-8 text-center text-green-100'>
                                  {qty}
                                </span>
                                <button
                                  className='w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-colors disabled:opacity-50'
                                  onClick={() => handleUpdateQuantity(cartEntry, qty + 1)}
                                  disabled={isAdding}
                                  aria-label="Increase quantity"
                                >
                                  <FaPlus className='text-green-100' />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item)}
                                disabled={isAdding}
                                className='bg-green-900/80 px-4 py-1.5 rounded-full font-cinzel text-xs uppercase sm:text-sm tracking-wider transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-900/20 relative overflow-hidden border-green-600/50 disabled:opacity-50 disabled:hover:scale-100'
                                aria-label={`Add ${item.name} to cart`}
                              >
                                <span className='relative z-10 text-xs text-white'>
                                  {isAdding ? 'Adding...' : 'Add to Cart'}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className='flex justify-center mt-16'>
          <Link 
            className='bg-green-900/30 border-2 border-green-800/30 text-green-100 px-8 sm:px-10 py-3 rounded-full font-cinzel uppercase tracking-widest transition-all duration-300 hover:bg-green-800/20 hover:text-green-900 hover:scale-105 hover:shadow-lg hover:shadow-green-900/20 backdrop-blur-sm' 
            to='/menu'
          >
            Explore Full Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OurHomeMenu;