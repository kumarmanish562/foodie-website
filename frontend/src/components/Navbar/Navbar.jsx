import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { GiChefToque, GiForkKnifeSpoon } from 'react-icons/gi';
import {
  FiHome,
  FiBook,
  FiStar,
  FiPhone,
  FiShoppingCart,
  FiLogOut,
  FiKey,
  FiPackage,
} from 'react-icons/fi';
import { useCart } from '../../CartContext/CartContext';
import Login from '../Login/Login';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();

  // AUTH STATE AND LOGIN MODAL MANAGEMENT
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('loginData'))
  );

  useEffect(() => {
    // Show login modal if path is '/login'
    setShowLoginModal(location.pathname === '/login');

    // Sync auth state from localStorage in case it changes (e.g. after reload)
    setIsAuthenticated(Boolean(localStorage.getItem('loginData')));
  }, [location.pathname]);

  // Handle successful login
  const handleLoginSuccess = () => {
    localStorage.setItem('loginData', JSON.stringify({ loggedIn: true }));
    setIsAuthenticated(true);
    navigate('/');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('loginData');
    setIsAuthenticated(false);
  };

  const renderDesktopAuthButton = () => {
    const baseButtonStyles =
      'px-3  lg:px-4 py-1.5  lg:py-2 bg-gradient-to-br from-green-200 to-green-700 text-[#14532D] rounded-2xl font-bold hover:shadow-lg hover:shadow-green-600/40 transition-all transform hover:scale-[1.02] border-2 border-green-600/20 flex items-center space-x-2 shadow-md shadow-green-900/20 text-sm';

    return isAuthenticated ? (
      <button onClick={handleLogout} className={baseButtonStyles}>
        <FiLogOut className="text-base lg:text-lg" />
        <span className="text-shadow">Logout</span>
      </button>
    ) : (
      <button onClick={() => navigate('/login')} className={baseButtonStyles}>
        <FiKey className="text-base  lg:text-lg" />
        <span className="text-shadow">Login</span>
      </button>
    );
  };

  const renderMobileAuthButton = () => {
    const baseMobileBtnStyles =
      'w-full px-4 py-3 bg-gradient-to-br from-green-500 to-green-700 text-[#14532D] rounded-xl font-semibold flex items-center justify-center space-x-2 text-sm';

    return isAuthenticated ? (
      <button onClick={handleLogout} className={baseMobileBtnStyles}>
        <FiLogOut />
        <span>Logout</span>
      </button>
    ) : (
      <button
        onClick={() => {
          navigate('/login');
          setIsOpen(false);
        }}
        className={baseMobileBtnStyles}
      >
        <FiKey />
        <span>Login</span>
      </button>
    );
  };

  const navLinks = [
    { name: 'Home', to: '/', icon: <FiHome /> },
    { name: 'Menu', to: '/menu', icon: <FiBook /> },
    { name: 'About', to: '/about', icon: <FiStar /> },
    { name: 'Contact', to: '/contact', icon: <FiPhone /> },
    ...(isAuthenticated ? [
      {name: 'My Orders', to:'my/order',icon:<FiPackage />}
  ]: [])
  ];

  return (
    <nav className="bg-[#052512] border-b-8 border-green-900/30 shadow-[0_25px_50px_-12px] font-vibes group/nav sticky top-0 z-50 overflow-x-hidden">
      {/* Top Decorative Line */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4">
        {/* Gradient Line */}
        <div className="h-[6px] bg-gradient-to-r from-transparent via-green-600/50 to-transparent shadow-[0_0_20px] shadow-green-500/30 rounded-full" />

        {/* Decorative Icons */}
        <div className="flex justify-between items-center px-6 mt-1">
          <GiForkKnifeSpoon
            className="text-green-500/40 rotate-45 -ml-2"
            size={32}
          />
          <GiForkKnifeSpoon
            className="text-green-500/40 rotate-45 -mr-2"
            size={32}
          />
        </div>
      </div>

      {/* Main Navigation Container */}
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex justify-between items-center h-16 md:h-20 lg:h-24">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center space-x-2 group relative md:translate-x-4 lg:-translate-x-6 ml-0 md:ml-2">
            <div className="absolute -inset-4 bg-green-500/10 rounded-full blur-xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
            <GiChefToque className="text-3xl md:text-4xl lg:text-5xl text-green-500 transition-all group-hover:rotate-12 group-hover:text-green-400 hover:drop-shadow-[0_0_15px] hover:drop-shadow-500/20" />

            <div className="flex flex-col relative ml-2 max-w-[140px] md:max-w-[160px] lg:max-w-none">
              <NavLink
                to="/"
                className="text-2xl md:text-xl lg:text-4xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent font-monsieur tracking-wider drop-shadow-[0_2px_2px] drop-shadow-black -translate-x-2 truncate md:truncate-none font-cursive"
              >
                m&m meals
              </NavLink>
              <div className="h-[3px] bg-gradient-to-r from-green-600/30 via-green-400/50 to-green-600/30 w-full mt-1 ml-1 shadow-[0_2px_5px] shadow-green-500/20" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 md:space-x-1 lg:space-x-4 flex-1 justify-end">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `group px-3 md:px-3 lg:px-4 py-2 md:py-2 lg:py-3 text-sm md:text-[15px] lg:text-base relative transition-all duration-300 flex items-center hover:bg-green-900/20 rounded-3xl border-2 
                  ${isActive
                    ? 'border-green-600/50 bg-green-900/20 shadow-[inset_0_0_15px] shadow-green-500/20'
                    : 'border-green-900/30 hover:border-green-600/50'
                  } shadow-md shadow-green-900/20`
                }
              >
                <span className="mr-2 text-sm md:text-[15px] lg:text-base text-green-500 group-hover:text-green-300 transition-all">
                  {link.icon}
                </span>
                <span className="text-green-100 group-hover:text-green-300 relative">
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-green-400 transition-all group-hover:w-full" />
                </span>
              </NavLink>
            ))}

            {/* Cart Icon */}
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 ml-3 md:ml-3 lg:ml-6 mb-2 md:mr-3 lg:mr-4">
              <NavLink
                to="/cart"
                className="p-2 md:p-2 lg:p-3 text-green-100 rounded-xl transition-all relative border-2 border-green-900/30 hover:border-green-600/50 group hover:bg-green-900/20 hover:shadow-lg hover:shadow-green-500/30 shadow-md shadow-green-900/20"
              >
                <FiShoppingCart className="text-base md:text-lg lg:text-lg" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-green-100 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </NavLink>
              {renderDesktopAuthButton()}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden items-center mr-2">
            <button
              className="text-green-500 hover:text-green-300 focus:outline-none transition-all p-2 rounded-xl border-2 border-green-900/30 hover:border-green-600/50 relative shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-500/30"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="space-y-2 relative">
                <span
                  className={`block w-6 h-[2px] bg-current transition-all ${isOpen ? 'rotate-45 translate-y-[7px]' : ''
                    }`}
                />
                <span
                  className={`block w-6 h-[2px] bg-current ${isOpen ? 'opacity-0' : ''
                    }`}
                />
                <span
                  className={`block w-6 h-[2px] bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''
                    }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation  */}
      {isOpen && (
        <div className="md:hidden bg-[#14532D] border-t-4 border-green-900/40 relative shadow-lg shadow-green-900/30 w-full">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block items-center px-4 py-3 text-sm rounded-xl border-2 transition-all ${isActive
                    ? 'bg-green-600/30 border-green-600/50 text-green-400'
                    : 'border-green-900/30 text-green-100 hover:bg-green-600/20'
                  }`
                }
              >
                <span className="mr-3 text-green-500">{link.icon}</span>
                {link.name}
              </NavLink>
            ))}

            <div className="pt-4 border-t-2 border-green-900/30 space-y-2">
              <NavLink
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-center text-green-100 rounded-xl border-2 bg-green-900/30 hover:border-green-600/50 flex items-center justify-center space-x-2 text-sm"
              >
                <FiShoppingCart className="text-lg" />
                {totalItems > 0 && (
                  <span className="top-2 right-2 bg-green-600 text-green-100 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </NavLink>

              {renderMobileAuthButton()}
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#03240f] to-[#03230d] rounded-xl p-6 w-full max-w-[480px] relative border-4 border-green-700/30 shadow-[0_0_30px] shadow-green-500/30">
            <button
              onClick={() => navigate('/')}
              className="absolute top-2 right-2 text-green-500 hover:text-green-300 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-4 text-center font-cursive">
              m&m meals
            </h2>
            <Login
              onLoginSuccess={handleLoginSuccess}
              onClose={() => navigate('/')}
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
