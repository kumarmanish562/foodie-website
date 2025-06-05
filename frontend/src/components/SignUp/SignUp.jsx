// Importing necessary React and React Router hooks and icons
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaEyeSlash, FaEye, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Reusable toast component
const AwesomeToast = ({ message, icon, isError = false }) => (
  <div className={`animate-slide-in fixed bottom-6 right-6 flex items-center px-6 py-4 rounded-lg shadow-lg border-2 ${
    isError 
      ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-300/20' 
      : 'bg-gradient-to-br from-green-500 to-green-600 border-green-300/20'
  }`}>
    <span className='text-2xl mr-3 text-white'>{icon}</span>
    <span className='font-semibold text-white'>{message}</span>
  </div>
);

const SignUp = () => {
  const [showToast, setShowToast] = useState({ visible: false, message: '', icon: null, isError: false });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (showToast.visible && showToast.message === 'Sign Up Successful') {
      const timer = setTimeout(() => {
        setShowToast({ visible: false, message: '', icon: null, isError: false });
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast, navigate]);
  
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Enhanced form validation
  const validateForm = () => {
    if (!formData.username.trim()) {
      throw new Error('Username is required');
    }
    if (formData.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!formData.email.trim()) {
      throw new Error('Email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Please enter a valid email address');
    }
    if (!formData.password) {
      throw new Error('Password is required');
    }
    if (formData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Validate form
      validateForm();
      
      console.log('Attempting signup with:', { ...formData, password: '[HIDDEN]' });
      
      const res = await axios.post(`${API_URL}/api/user/register`, {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      console.log('Register Response:', res.data);

      if (res.data.success && res.data.token) {
        localStorage.setItem('authToken', res.data.token);
        setShowToast({
          visible: true,
          message: 'Sign Up Successful',
          icon: <FaCheckCircle />,
          isError: false
        });
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      
      let errorMessage = 'Registration failed';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setShowToast({
        visible: true,
        message: errorMessage,
        icon: <FaCheckCircle />,
        isError: true
      });
      
      // Hide error toast after 3 seconds
      setTimeout(() => {
        setShowToast({ visible: false, message: '', icon: null, isError: false });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#000f02] p-4'>
      {showToast.visible && (
        <AwesomeToast 
          message={showToast.message} 
          icon={showToast.icon}
          isError={showToast.isError}
        />
      )}

      <div className='w-full max-w-md bg-gradient-to-br from-[#023014] to-[#012b07] p-8 rounded-xl shadow-lg border-4 border-green-700/30 transform transition-all duration-300 hover:shadow-2xl'>
        <h1 className='text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-6 hover:scale-105 transition-transform'>
          Create an Account
        </h1>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className='w-full px-4 py-3 rounded-lg bg-[#011f02] text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200 hover:scale-[1.02]'
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className='w-full px-4 py-3 rounded-lg bg-[#011f02] text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200 hover:scale-[1.02]'
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 rounded-lg bg-[#011f02] text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-200 hover:scale-[1.02]'
              required
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-4 flex items-center text-green-400 hover:text-green-600 transform hover:scale-125"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-[#2D1B0E] font-bold rounded-lg hover:scale-105 transition-transform duration-300 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100'
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <Link
            to='/login'
            className='group inline-flex items-center text-green-400 hover:text-green-600 transition-all duration-300'
          >
            <FaArrowLeft className='mr-2 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300' />
            <span className='transform group-hover:-translate-x-2 transition-all duration-300'>
              Back to Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
