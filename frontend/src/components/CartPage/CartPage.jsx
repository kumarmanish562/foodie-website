import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../CartContext/CartContext';
import { FaMinus, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [selectImage, setSelectedImage] = useState(null);

  return (
    <div className='min-h-screen overflow-x-hidden py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br  from-[#041c09] via-[#041c0b] to-[#0a210e]'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-12 animate-fade-in-down'>
          <span className='font-dancingscript block text-5xl sm:text-6xl md:text-7xl mb-2 bg-gradient-to-r from-green-100 to-green-400 bg-clip-text text-transparent'>
            Your Cart
          </span>
        </h1>

        {cartItems.length === 0 ? (
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
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className='group bg-green-900/20 p-4 rounded-2xl border-4 border-dashed border-green-500 backdrop-blur-sm flex flex-col items-center gap-4 transition-all duration-300 hover:border-solid hover:shadow-xl hover:shadow-green-900/10 transform hover:-translate-y-1 animate-fade-in'
                >
                  <div
                    className='w-24 h-24 flex-shrink-0 cursor-pointer relative overflow-hidden rounded-lg transition-transform duration-300'
                    onClick={() => setSelectedImage(item.image)}
                  >
                    <img src={item.image} alt={item.name} className='w-full h-full object-contain' />
                  </div>

                  <div className=' w-full text-center'>
                    <h3 className=' text-xl font-dancingscript text-green-100'>
                      {item.name}
                    </h3>
                <p className=' text-green-100/80 font-cinzel mt-1'> ₹{item.price}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <button onClick={()=> updateQuantity(item.id, Math.max(1, item.quantity -1))}
                      className=' w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-all duration-300 active:scale-95'>
                        <FaMinus className='w-8 h-4  text-green-100 '/>
                      </button>
                      <span className='w-8  text-center text-green-100 font-cinzel'>
                        {item.quantity}
                      </span>
                      <button onClick={()=> updateQuantity(item.id, item.quantity +1)}
                      className=' w-8 h-8 rounded-full bg-green-900/40 flex items-center justify-center hover:bg-green-800/50 transition-all duration-300 active:scale-95'>
                        <FaPlus className='w-8 h-4  text-green-100 '/>
                      </button>
                       </div>

                       <div className=' flex items-center justify-between w-full'>
                        <button onClick={() => removeFromCart(item.id)}
                        className=' bg-green-900/40 px-3 py-1 rounded-full font-cinzel text-xs uppercase transition-all duration-300 hover:bg-green-800/50 flex items-center gap-1 active:scale-95'>
                            <FaTrash className=' w-4 h-4 text-green-100' />
                            <span className=' text-green-100'>
                              Remove
                            </span>
                            
                        </button>
                          <p className=' text-sm font-dancingscript text-green-300'>
                        ₹{item.price * item.quantity}
                            </p>
                       </div>
                </div>
              ))}
            </div>

            <div className=' mt-12 pt-8 border-t border-green-800/30 animate-fade-in-up'>
                <div className=' flex flex-col sm:flex-row justify-between items-center gap-8'>
                  <Link to='/menu' className=' bg-green-900/40 px-8 py-3 rounded-full font-cinzel uppercase tracking-wider hover:bg-green-800/50 transition-all duration-300 text-green-100 inline-flex items-center gap-2 hover:gap-3 active:scale-95'>
                  Continue Food Order
                  </Link>
                  <div className=' flex items-center gap-8'>
                    <h2 className=' text-3xl font-dancingscript text-green-100'>
                      Total: ₹{cartTotal}
                    </h2>
                    <button  className=' bg-green-900/40 px-8 py-3 rounded-full font-cinzel uppercase tracking-wider hover:bg-green-800/50 transition-all duration-300 text-green-100 flex items-center gap-2  active:scale-95' >
                        Checkout Now
                    </button>
                  </div>
                </div>
            </div>
          </>
        )}
      </div>
      {selectImage && (
        <div className=' fixed inset-0 z-50 flex items-center justify-center bg-green-900/40 bg-opacity-75 backdrop-blur-sm p-4 overflow-auto' onClick={() =>
          setSelectedImage(null)}>
              <div className=' relative max-w-full max-h-full'>
                <img src={selectImage} alt="Full View" className=' max-w-[90vw] max-h-[90vh] rounded-lg' />
                    <button onClick={() => 
                      setSelectedImage(null)
                    } className=' absolute top-1 right-1 bg-green-900/80 rounded-full p-2 text-black hover:bg-green-800/90 transition-transform duration-200 active:scale-90'>
                        <FaTimes className='w-6 h-6' />
                    </button>
              </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
