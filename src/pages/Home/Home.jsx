import React from 'react';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import SpecialOffer from '../../components/SpecialOffer/SpecialOffer.jsx';
import AboutHome from '../../components/AboutHome/AboutHome.jsx'

const Home = () => {
  return (
    <>
      <Navbar />
      <Banner />
      <SpecialOffer />
      <AboutHome />
      
    </>
  );
};

export default Home;
