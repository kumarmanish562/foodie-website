import { useEffect, useState } from 'react';
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
import axios from 'axios'

const url = `http://localhost:4000`

const Login = ({ onLoginSuccess, onClose }) => {
  // State to control toast visibility after successful login
  const [showToast, setShowToast] = useState({visible: false, message:'' , isError: false});

  // State to toggle visibility of the password field
  const [showPassword, setShowPassword] = useState(false);

  // State to store login form input values
  const [formData, setFormData] = useState({
    email: '',          // Change from 'username' to 'email'
    password: '',
    rememberMe: false,
  });

  // Load saved login data on mount
  useEffect(() => {
    const stored = localStorage.getItem('loginData');
    if (stored) setFormData(JSON.parse(stored));
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

  // Handle form submission
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.email || !formData.password) {
        setShowToast({ visible: true, message: 'Please fill in all fields', isError: true });
        setTimeout(() => setShowToast({ visible: false, message: '', isError: false }), 2000);
        return;
    }

    if (!validateEmail(formData.email)) {
        setShowToast({ visible: true, message: 'Please enter a valid email address', isError: true });
        setTimeout(() => setShowToast({ visible: false, message: '', isError: false }), 2000);
        return;
    }

    try {
        console.log('Attempting login to:', `${url}/api/user/login`);
        
        const res = await axios.post(`${url}/api/user/login`, {
            email: formData.email,
            password: formData.password,
        });
        
        if(res.status === 200 && res.data.success && res.data.token) {
            localStorage.setItem('authToken', res.data.token);

            // Remember me functionality - exclude password for security
            if (formData.rememberMe) {
                const { password: _unused, ...dataToStore } = formData;
                localStorage.setItem('loginData', JSON.stringify(dataToStore));
            } else {
                localStorage.removeItem('loginData');
            }

            setShowToast({ visible: true, message: 'Login Successful', isError: false });
            
            setTimeout(() => {
                setShowToast({ visible: false, message: '', isError: false });
                onLoginSuccess(res.data.token);
            }, 1500);
        } else {
            console.warn('Unexpected response:', res.data);
            throw new Error(res.data.message || 'Login Failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        
        let errorMessage = 'Login Failed';
        
        if (err.code === 'ECONNREFUSED') {
            errorMessage = 'Server is not running. Please try again later.';
        } else if (err.response?.status === 404) {
            errorMessage = 'Login service not found. Please contact support.';
        } else if (err.response?.status === 401) {
            errorMessage = 'Invalid email or password.';
        } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
        }
        
        setShowToast({ visible: true, message: errorMessage, isError: true });
        setTimeout(() => setShowToast({ visible: false, message: '', isError: false }), 3000);
    }
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
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showToast.visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
        }`}
      >
        <div className={`px-4 py-3 rounded-md shadow-lg flex items-center gap-2 text-sm ${
          showToast.isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          <FaCheckCircle className="flex-shrink-0" />
          <span>{showToast.message}</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input - Update the name and type */}
        <div className="relative">
          <FaUser className={iconClass} />
          <input
            type="email"           // Change to email type
            name="email"           // Change from 'username' to 'email'
            placeholder="Email"    // Update placeholder
            value={formData.email} // Change from formData.username
            onChange={handleChange}
            className={`${inputBase} pl-10 pr-4 py-3 bg-[#011f02] text-green-100 placeholder-green-400`}
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
