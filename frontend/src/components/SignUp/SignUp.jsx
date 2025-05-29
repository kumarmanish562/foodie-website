

// Importing necessary React and React Router hooks and icons
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaEyeSlash, FaEye, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const url = `http://localhost:400`

// Reusable toast component for showing success or status messages
const AwesomeToast = ({ message, icon }) => (
  <div className='animate-slide-in fixed bottom-6 right-6 flex items-center bg-gradient-to-br from-green-500 to-green-600 px-6 py-4 rounded-lg shadow-lg border-2 border-green-300/20'>

    {/* Icon passed as prop */}
    <span className='text-2xl mr-3 text-[#063615]'>{icon}</span>

    {/* Message passed as prop */}
    <span className='font-semibold text-[#031c0a]'>{message}</span>
  </div>
);


const SignUp = () => {

  // State to show/hide toast notification
  const [showToast, setShowToast] = useState({visible: false, message:'', icon:null});

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State to store user input
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  // Hook to navigate programmatically
  const navigate = useNavigate();
  useEffect(() => {
    if(showToast.visible && showToast.message === 'Sign Up Successful'){
      const timer = setTimeout(() => {
        setShowToast({visible: true, message:'', icon:null})
        navigate('/login');
      },2000)
      return() => clearTimeout(timer)
    }
  }, [showToast, navigate])
  // // Show toast and redirect to login after 2 seconds
  // useEffect(() => {
  //   if (showToast) {
  //     const timer = setTimeout(() => {
  //       setShowToast(false);
  //       navigate('/login'); // Redirect to login page
  //     }, 2000);

  //     // Cleanup timeout when component unmounts or toast state changes
  //     return () => clearTimeout(timer);
  //   }
  // }, [showToast, navigate]);

  // Toggle password visibility on eye icon click
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Handle input field changes and update form state
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign Up fired:', formData)
    try{
const res = await axios.post(`${url}/api/user/register`, formData)
console.log('Register Response:', res.data)

if(res.data.success && res.data.token){
  localStorage.setItem('authToken', res.data.token)
  setShowToast({
    visible: true,
    message: 'Sign up Successful',
    icon: <FaCheckCircle/>
  })
  return:
}
throw new Error(res.data.message || 'Registration failed');
    }catch(err){
      console.error('Registration Error', err)
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      setShowToast({visible: false, message:msg, icon: <FaCHeckCircle/>})

    }
  };


  return (
    <div className='min-h-screen flex items-center justify-center bg-[#000f02] p-4'>
      {/* Show toast notification when showToast is true */}
      {showToast &&
        <AwesomeToast message="Sign Up Successful" icon={<FaCheckCircle />} />
      }

      {/* Sign-up form container */}
      <div className='w-full max-w-md bg-gradient-to-br from-[#023014] to-[#012b07] p-8 rounded-xl shadow-lg border-4 border-green-700/30 transform transition-all duration-300 hover:shadow-2xl'>

        {/* Form heading */}
        <h1 className='text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-6 hover:scale-105 transition-transform'>
          Create an Account
        </h1>

        {/* Sign-up form */}
        <form onSubmit={handleSubmit} className='space-y-4'>

          {/* Username input */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className='w-full px-4 py-3 rounded-lg bg-[#011f02] text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green transition-all duration-200 hover:scale-[1.02]'
            required
          />

          {/* Email input */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className='w-full px-4 py-3 rounded-lg bg-[#011f02] ] text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green transition-all duration-200 hover:scale-[1.02]'
            required
          />


          {/* Password input field with show/hide toggle */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} // Toggle between text/password
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 rounded-lg bg-[#011f02]  text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green transition-all duration-200 hover:scale-[1.02]'
              required
            />

            {/* Toggle button for showing/hiding password */}
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-4 flex items-center text-green-400 hover:text-green-600 transform hover:scale-125"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit button */}
          <button
            type='submit'
            className='w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-[#2D1B0E] font-bold rounded-lg hover:scale-105 transition-transform duration-300 hover:shadow-lg'
          >
            Sign Up
          </button>
        </form>

        {/* Back to login link */}
        <div className='mt-6 text-center'>
          <Link
            to='/login'
            className='group inline-flex items-center text-green-400 hover:text-green-600 transition-all duration-300'
          >
            {/* Left arrow with slide-in animation */}
            <FaArrowLeft className='mr-2 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300' />

            {/* Text label */}
            <span className='transform group-hover:-translate-x-2 transition-all duration-300'>
              Back to Login
            </span>
          </Link>
        </div>

      </div>

    </div>

  )
}

export default SignUp
