import React from 'react';
import { aboutfeature } from '../../assets/dummydata';
import { Link } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import AboutImage from '../../assets/AboutImage.png';
import FloatingParticle from '../FloatingParticle/FloatingParticle';
import './AboutHome.css';

const AboutHome = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-[#041c09] via-[#041c0b] to-[#0a210e] text-white py-10 sm:py-20 relative overflow-hidden'>
      
      {/* Light Blur Effects in Background */}
      <div className='absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none'>
        <div className='absolute top-1/4 left-20 w-96 h-96 bg-green-800/20 rounded-full blur-3xl mix-blend-soft-light' />
        <div className='absolute bottom-1/4 right-0 w-80 h-80 bg-orange-800/15 rounded-full blur-3xl mix-blend-soft-light' />
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center lg:gap-8 xl:gap-16 relative'>

        {/* Left Content */}
        <div className='w-full order-1 lg:order-2 space-y-8 sm:space-12 relative'>
          <div className='space-y-4 sm:space-y-8 px-4 sm:px-0'>
            <h2 className='text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-tight'>
              <span className='font-cursive text-4xl sm:text-5xl md:text-6xl bg-gradient-to-r from-green-400 to-red-500 bg-clip-text text-transparent'>
                Epicurean Elegance
              </span>
              <br />
              <span className='inline-block mt-2 sm:mt-4 text-2xl sm:text-3xl md:text-4xl opacity-90 font-light font-dancingscript'>
                Where Flavors Dance &amp; Memories Bloom
              </span>
            </h2>
            <p className='text-base sm:text-lg md:text-xl opacity-90 leading-relaxed max-w-3xl font-serif italic border-l-4 bg-green-800/80 pl-4 sm:pl-6 py-2 bg-gradient-to-r from-white/8 to-transparent'>
              "In our kitchen, passion meets precision. We craft not just meals, but culinary journeys that linger on the plate and in the heart"
            </p>
          </div>

          {/* Features */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 px-4 sm:px-0'>
            {aboutfeature.map((item, i) => (
              <div
                key={i}
                className=' flex flex-col items-center justify-center gap-3 sm:gap-4 transition-transform duration-300 p-4 sm:p-5 hover:translate-x-2'
              >
                <div className={`p-3 sm:p-4 rounded-full bg-gradient-to-br ${item.color} transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className="text-2xl sm:text-3xl text-white" />
                </div>
                <div className='text-center'>
                  <h3 className='text-xl sm:text-2xl font-bold font-cursive'>{item.title}
                  <p className='opacity-80 text-sm sm:text-base'>{item.text}</p></h3>
                </div>
              </div>
            ))}
          </div>

          {/* Button */}
          <div className='flex flex-wrap gap-4 items-center mt-6 sm:mt-8 px-4 sm:px-0'>
            <Link to='/about' className='px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-800 to-orange-600 rounded-xl font-bold hover:scale-[1.02] transition-transform duration-300 flex items-center gap-2 sm:gap-3 shadow-xl hover:shadow-green-500/20 group relative overflow-hidden'>
              <span className='absolute inset-0 bg-gradient-to-r from-green-800/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></span>
              <FaInfoCircle className='text-lg sm:text-xl animate-plus' />
              <span className='font-cursive text-lg sm:text-xl'>Unveil Our Legacy</span>
            </Link>
          </div>
        </div>

        {/* Right Side Image */}
        <div className='w-full order-2 lg:order-1 md:max-w-md lg:max-w-none lg:w-7/12 mt-12 mb-10 lg:mb-0 relative group transform hover:scale-[1.0] transition-all duration-500'>
          <div className='relative rounded-[4rem] overflow-hidden border-4 border-green-900/50 hover:border-green-600/80 transition duration-500 shadow-2xl shadow-black/50'>
            <div className='absolute inset-0 bg-gradient-to-br from-green-400/15 via-transparent to-green-600/10 mix-blend-soft-light' />
            <img src={AboutImage} alt='Restaurant' className='w-full h-auto object-cover aspect-[3/4] transform rotate-1 hover:rotate-0 transition-all duration-500' />
            <div className='absolute -bottom-12 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-green-900/30 blur-3xl z-0' />
          </div>
          <div className='absolute -top-6 -right-6 w-24 h-24 bg-green-500/50 rounded-full blur-xl' />
        </div>

      </div>

      {/* Particle Background */}
      <FloatingParticle />
    </div>
  );
};

export default AboutHome;
