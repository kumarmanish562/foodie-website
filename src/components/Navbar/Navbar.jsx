import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GiChefToque, GiForkKnifeSpoon } from "react-icons/gi";
import {
  FiHome,
  FiBook,
  FiStar,
  FiPhone,
  FiShoppingCart,
} from 'react-icons/fi';
import { useCart } from '../../CartContext/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  const navLinks = [
    { name: 'Home', to: '/', icon: <FiHome /> },
    { name: 'Menu', to: '/menu', icon: <FiBook /> },
    { name: 'About', to: '/about', icon: <FiStar /> },
    { name: 'Contact', to: '/contact', icon: <FiPhone /> },
  ];

  return (
    <nav className='bg-[#2D1B0E] border-b-8 border-amber-900/30 shadow-[0_25px_50px_-12px] font-vibes group/nav sticky top-0 z-50 overflow-x-hidden'>
      {/* Top Decorative Line */}
      <div className='absolute -top-3 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4'>
        <div className='h-[6px] bg-gradient-to-r from-transparent via-amber-600/50 to-transparent shadow-[0_0_20px] shadow-amber-500/30' />
        <div className='flex justify-between px-6'>
          <GiForkKnifeSpoon className='text-amber-500/40 -ml-2 rotate-45' size={32} />
          <GiForkKnifeSpoon className='text-amber-500/40 -mr-2 rotate-45' size={32} />
        </div>
      </div>

      {/* Main Navigation Container */}
      <div className='max-w-7xl mx-auto px-4 relative'>
        <div className='flex justify-between items-center h-16 md:h-20 lg:h-24'>
          {/* Logo Section */}
          <div className='flex-shrink-0 flex items-center space-x-2 group relative md:translate-x-4 lg:-translate-x-6 ml-0 md:ml-2'>
            <div className='absolute -inset-4 bg-amber-500/10 rounded-full blur-xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300' />
            <GiChefToque className='text-3xl md:text-4xl lg:text-5xl text-amber-500 transition-all group-hover:rotate-12 group-hover:text-amber-400 hover:drop-shadow-[0_0_15px] hover:drop-shadow-500/20' />

            <div className='flex flex-col relative ml-2 max-w-[140px] md:max-w-[160px] lg:max-w-none'>
              <NavLink to='/' className='text-2xl md:text-xl lg:text-4xl bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent font-monsieur tracking-wider drop-shadow-[0_2px_2px] drop-shadow-black -translate-x-2 truncate md:truncate-none'>
                Foodie
              </NavLink>
              <div className='h-[3px] bg-gradient-to-r from-amber-600/30 via-amber-400/50 to-amber-600/30 w-full mt-1 ml-1 shadow-[0_2px_5px] shadow-amber-500/20' />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-2 md:space-x-1 lg:space-x-4 flex-1 justify-end'>
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `group px-3 md:px-3 lg:px-4 py-2 md:py-2 lg:py-3 text-sm md:text-[15px] lg:text-base relative transition-all duration-300 flex items-center hover:bg-amber-900/20 rounded-3xl border-2 
                  ${
                    isActive
                      ? 'border-amber-600/50 bg-amber-900/20 shadow-[inset_0_0_15px] shadow-amber-500/20'
                      : 'border-amber-900/30 hover:border-amber-600/50'
                  } shadow-md shadow-amber-900/20`
                }
              >
                <span className='mr-2 text-sm md:text-[15px] lg:text-base text-amber-500 group-hover:text-amber-300 transition-all'>
                  {link.icon}
                </span>
                <span className='text-amber-100 group-hover:text-amber-300 relative'>
                  {link.name}
                  <span className='absolute -bottom-1 left-0 w-0 h-[2px] bg-amber-400 transition-all group-hover:w-full' />
                </span>
              </NavLink>
            ))}

            {/* Cart Icon */}
            <div className='flex items-center space-x-2 md:space-x-3 lg:space-x-4 ml-3 md:ml-3 lg:ml-6 mb-2 md:mr-3 lg:mr-4'>
              <NavLink
                to='/cart'
                className='p-2 md:p-2 lg:p-3 text-amber-100 rounded-xl transition-all relative border-2 border-amber-900/30 hover:border-amber-600/50 group hover:bg-amber-900/20 hover:shadow-lg hover:shadow-amber-500/30 shadow-md shadow-amber-900/20'
              >
                <FiShoppingCart className='text-base md:text-lg lg:text-lg' />
                {totalItems > 0 && (
                  <span className='absolute -top-2 -right-2 bg-amber-600 text-amber-100 text-xs w-5 h-5 rounded-full flex items-center justify-center'>
                    {totalItems}
                  </span>
                )}
              </NavLink>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden items-center mr-2'>
            <button
              className='text-amber-500 hover:text-amber-300 focus:outline-none transition-all p-2 rounded-xl border-2 border-amber-900/30 hover:border-amber-600/50 relative shadow-md shadow-amber-900/20 hover:shadow-lg hover:shadow-amber-500/30'
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className='space-y-2 relative'>
                <span className={`block w-6 h-[2px] bg-current transition-all ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block w-6 h-[2px] bg-current ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-[2px] bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className='md:hidden bg-[#2D1B0E] border-t-4 border-amber-900/40 shadow-lg shadow-amber-900/30 w-full'>
          <div className='px-4 py-4 space-y-2'>
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm rounded-xl border-2 transition-all ${
                    isActive
                      ? 'bg-amber-600/30 border-amber-600/50 text-amber-300'
                      : 'border-amber-900/30 text-amber-100 hover:bg-amber-900/20'
                  }`
                }
              >
                <span className='mr-3 text-amber-500'>{link.icon}</span>
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
