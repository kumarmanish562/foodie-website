import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import ContactPage from './pages/ContactPage/ContactPage'
import AboutPage from './pages/AboutPage/AboutPage'
import Menu from './pages/Menu/Menu'
import Cart from './pages/Cart/Cart'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/contact' element={< ContactPage />} />
      <Route path='/about' element={ <AboutPage />} />
      <Route path='/menu' element={ <Menu />} />
      <Route path='/cart' element={ < Cart />} />
    </Routes>
  )
}

export default App
