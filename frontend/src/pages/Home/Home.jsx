import React from 'react';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import SpecialOffer from '../../components/SpecialOffer/SpecialOffer.jsx';
import AboutHome from '../../components/AboutHome/AboutHome.jsx'
import OurHomeMenu from '../../components/OurHomeMenu/OurHomeMenu.jsx';
import Footer from '../../components/Footer/Footer.jsx';

const Home = () => {
  return (
    <>
      <Navbar />
      <Banner />
      <SpecialOffer />
      <AboutHome />
      <OurHomeMenu />
      <Footer />
      
    </>
  );
};

export default Home;
