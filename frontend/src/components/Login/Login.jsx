import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaUserPlus
} from "react-icons/fa";
import { iconClass, inputBase } from '../../assets/dummydata';
import { Link } from 'react-router-dom';

const Login = ({ onLoginSuccess, onClose }) => {
  // State to control toast visibility after successful login
  const [showToast, setShowToast] = useState(false);

  // State to toggle visibility of the password field
  const [showPassword, setShowPassword] = useState(false);

  // State to store login form input values
  const [formData, setFormData] = useState({
    username: '',       // Username input
    password: '',       // Password input
    rememberMe: false,  // Checkbox to remember user
  });

  // Load saved login data on mount
  useEffect(() => {
    const stored = localStorage.getItem('loginData');
    if (stored) setFormData(JSON.parse(stored));
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rememberMe) {
      localStorage.setItem('loginData', JSON.stringify(formData));
    } else {
      localStorage.removeItem('loginData');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    onLoginSuccess();
  };

  // Handle input changes
  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Toggle password visibility
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <div
        className={`fixed top-4 z-50 transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
          }`}
      >
        <div className="bg-red-800 text-white px-4 py-3 rounded-md shadow-lg items-center flex gap-2 text-sm">
          <FaCheckCircle className="flex-shrink-0" />
          <span>Login Successful</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <div className="relative">
          <FaUser className={iconClass} />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className={`${inputBase} pl-10 pr-4 py-3 bg-[#011f02]  text-green-100 placeholder-green-400 `}
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <FaLock className={iconClass} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`${inputBase} pl-10 pr-4 py-3 bg-[#011f02]  text-green-100 placeholder-green-400 `}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#011f02] text-green-400"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {/* // Checkbox for "Remember me" option */}
        <div className='flex items-center'>
          <label className='flex items-center'>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className='from-checkbox h-5 w-5 text-green-600 bg-[#011f02]  border-green-400 rounded focus:ring-green-600'
            />
            <span className='ml-2 text-green-100'>Remember me</span>
          </label>
        </div>
        {/* Submit Button */}
        <button
          className='w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-[#022709] font-bold rounded-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform'
        >
          Sign In <FaArrowRight />
        </button>

      </form>

      {/* Link to Sign Up page */}
      <div className='text-center mt-4'>
        <Link
          to='/signup'
          onClick={onClose}
          className='inline-flex items-center gap-2 text-green-400 hover:text-green-600 transition-colors'
        >
          <FaUserPlus /> Create New Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
