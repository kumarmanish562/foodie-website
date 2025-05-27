import React, { useState } from 'react'
import { useCart } from '../../CartContext/CartContext';
import { dummyMenuData } from '../../assets/OmDD';
import { FaPlus, FaMinus } from 'react-icons/fa';
import './OurMenu.css';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Mexican', 'Italian', 'Desserts', 'Drinks'];

const OurMenu = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

    const displayItems = (dummyMenuData[activeCategory] || []).slice(0, 12);
    const { cartItems = [], addToCart, removeFromCart } = useCart()
    const getQuantity = (id) => {
    const item = cartItems.find((item) => item.id === id);
    return item ? item.quantity : 0;
  };

   return (
    <div className='bg-gradient-to-br bg-[#052512] via-[#033f12] to-[#021a0b] min-h-screen py-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-br from-green-800/50 via-red-500 to-orange-800'>
          <span className='font-dancingscript block text-5xl md:text-7xl sm:text-6xl mb-2'>
  Our Exquisite Menu.
</span>

          <span className='block text-xl sm:text-2xl md:text-3xl font-cinzel mt-4 text-green-100/80'>
            A Symphony of Flavours
          </span>
        </h2>

        <div className='flex flex-wrap justify-center gap-4 mb-16'>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`px-4 sm:px-6 py-2 rounded-full border-2 transition-all duration-300 transform font-cinzel text-sm sm:text-left tracking-widest backdrop-blur-sm ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-green-700/80 to-green-700/50 border-green-800 scale-105 shadow-xl shadow-green-500/30'
                  : 'bg-green-900/20 border-green-800/30 text-green-100/90 hover:bg-green-800/40 hover:scale-95'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

       <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {displayItems.map((item, i) => {
            const quantity = getQuantity(item.id);
            return (
              <div
                key={item.id}
                className='relative bg-green-900/20 rounded-2xl overflow-hidden border border-green-800/30 backdrop-blur-sm flex flex-col transition-all duration-500'
                style={{ '--index': i }}
              >
                <div className='relative h-48 sm:h-56 md:h-60 flex items-center justify-center bg-black/10'>
                  <img
                    src={item.image}
                    alt={item.name}
                    className='max-h-full max-w-full object-contain transition-all duration-700'
                  />
                </div>

                <div className='p-4 sm:p-6 flex flex-col flex-grow'>
                  <div className='absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-green-800/30 to-transparent opacity-50 transition-all duration-300' />
                  
                  <h3 className='text-xl sm:text-2xl mb-2 font-dancingscript text-green-100 transition-colors'>
                    {item.name}
                  </h3>
                  
                  <p className='text-green-100/80 text-xs sm:text-sm mb-4 font-cinzel leading-relaxed'>
                    {item.description}
                  </p>

                  <div className='mt-auto flex items-center gap-4 justify-between'>
                    <div className='bg-green-100/10 backdrop-blur-sm px-3 py-1 rounded-2xl shadow-lg'>
                      <span className='text-xl font-bold text-green-300 font-dancingscript'>
                        ₹{item.price}
                      </span>
                    </div>

                    <div className='flex items-center gap-2'>
                      {quantity > 0 ? (
                        <>
                          <button
                            className='w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-colors'
                            onClick={() =>
                              quantity > 1
                                ? addToCart(item, quantity - 1)
                                : removeFromCart(item.id)
                            }
                          >
                            <FaMinus className='text-green-100' />
                          </button>
                          <span className='w-8 text-center text-green-100'>
                            {quantity}
                          </span>
                          <button
                            className='w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-colors'
                            onClick={() => addToCart(item, quantity + 1)}
                          >
                            <FaPlus className='text-green-100' />
                          </button>
                        </>
                      ) : (
                         <button
                          onClick={() => addToCart(item, 1)}
                          className='bg-green-900/80 px-4 py-1.5 rounded-full font-cinzel text-xs uppercase sm:text-sm tracking-wider transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-900/20 relative overflow-hidden border-green-600/50'
                        >
                          <span className='relative z-10 text-xs text-white'>
                            Add to Cart
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
         
      </div>
    </div>
  );
}

export default OurMenu