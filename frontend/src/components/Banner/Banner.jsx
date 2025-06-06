import React, { useState } from 'react'
import { FaDownload, FaSearch,FaPlay, FaTimes } from "react-icons/fa";
import {bannerAssets} from '../../assets/dummydata'

const Banner = () => {

  const [searchQuery, setSearchQuery] = useState('')
  const {bannerImage, orbitImages, video } =bannerAssets

  const[showVideo, setShowVideo] = useState(false);
  const handleSearch = (e) =>
  {
      e.preventDefault();
    console.log('Searching for:',searchQuery)
  }
    return (
    <div className=' relative'>
      < div className='bg-gradient-to-br from-[#02260e] to-[#042c0e] text-white py-16 px-4 sm:px-8 relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-r from-green-900/50 to-green-700/10'/>
      < div className=' max-w-6xl mx-auto flex flex-col md:flex-row items-center gao-12 relative z-10'>
      {/* LEFT CONTENT */}
      <div className='flex-1 space-y-8 relative md:pe-8 lg:pr-19 txt-center md:text-left'>
        <h1 className='text-4xl sm:text-5xl md:text-4xl lg:text-6xl font-bold leading-tight font-serif drop-shadow-md'>
          Food You Love, <br />
          <span className='text-orange-400 bg-gradient-to-r from-green-400 to-orange-300 bg-clip-text'>
            Delivered With Care
          </span>
        </h1>
        <p className='text-lg md:text-lg lg:text-xl font-playfair italic sm:text-xl text-green-200 max-w-xl opcaity-90 mx-auto md:mx-0'>
         Expert cooks and speedy delivery, ready to serve you. Hot and flavorful food delivered straight to your door in under 30 minutes!
        </p>
          <form onSubmit={handleSearch} className='relative max-w-2xl mx-auto md:mx-0 group'>
            <div className='relative flex items-center bg-green-900/30 rounded-xl border-2 border-green-900
            shadow-2xl hover:bg-green-700/50 transition-all duration-300'>
              <div className='pl-6 pr-3 py-4'>
                <FaSearch className='text-xl text-green-400/80' />
              </div>
              <input type='text' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Discoveer your next favorite meal....'
              className='w-full py-4 pr-6 bg-transparent outline-none placeholder-green-200/70 text-lg font-medium tracking-wide'></input>
              <button  type='submit'  className='mr-4 px-6 py-3 bg-gradient-to-r from-green-400 to-red-300 rounded-lg font-semibold text-green-900 hover:from-green-300  hover:to-green-200 transition-all duration-300 shadow-lg hover:shadow-green-300/20'>
              Search
              </button>

            </div>
            </form>

            <div className='flex flex-wrap gap-4 justify-center md:justify-start mt-6'>
          
              <button onClick={() => setShowVideo(true)}className='group flex items-center gap-3 bg-gradient-to-r from-green-400 to-green-300 hover:from-green-300 hover:to-green-200 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg 
              hover:shadow-green-300/30'>
                <FaPlay className='text-xl text-green-900' />
                <span className='text-lg text-green-900 font-semibold'>
                  Watch Video
                </span>
              </button>
            </div>
      </div>

      {/* Right Images  Container With Orbital images*/}
      <div className='fles-1 relative group mt-8 md:mt-0 min-h-[300px] sm:min-h-[400px]'>
        {/* Main Img */}
        <div className='relative rounded-full p-1 bg-gradient-to-br from-green-700 via-green-800 to-green-700       shadow-2xl z-20 w-[250px] xs:w-[250px] sm:w-[350px] h-[250px] xs:h-[300px] sm:h-[350px] mx-auto'>
          <img src={bannerImage} alt="Banner" className='rounded-full bordeer-4 xs:border-8 border-green-900/50 w-full h-full object-cover object-top ' />
          <div className='absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-green-900/40 mix-blend-multiply' />
        </div>

          {/* ORBITAL img */}
{orbitImages.map((imgSrc, index) => (
  <div
    key={index}
    className={`
      absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
      ${index === 0 ? 'orbit' : `orbit-delay-${index * 5}`}
      w-[80px] xs:w-[100px] sm:w-[150px] h-[80px] xs:h-[100px] sm:h-[150px]
    `}
  >
    <img
      src={imgSrc}
      alt={`orbital ${index + 1}`}
      className="w-full h-full rounded-full border border-green-500/30 shadow-lg bg-green-900/20 p-1 object-cover"
    />
  </div>
))}

        </div>
      </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className=' fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-lg p-4'>
          <button onClick={() => 
            setShowVideo(false)}
            className=' absolute top-6 right-6 text-green-400 hover:text-shadow-green-300 text-3xl z-10 transition-all'>
              <FaTimes />
            </button>
           <div className='w-full max-w-4xl mx-auto'>
            <video controls autoPlay className='w-full aspect-video object-contain rounded-lg shadow-2xl'>
              <source src={video} type='video/mp4' />


            </video>
           </div>
        </div>
      )

      }
    </div>
  )
}

export default Banner