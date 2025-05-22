import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import ContactPage from './pages/ContactPage/ContactPage'
import AboutPage from './pages/AboutPage/AboutPage'
import Menu from './pages/Menu/Menu'
import Cart from './pages/Cart/Cart'
import SignUp from './components/SignUp/SignUp'


const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/contact' element={< ContactPage />} />
      <Route path='/about' element={ <AboutPage />} />
      <Route path='/menu' element={ <Menu />} />
      <Route path='/cart' element={ < Cart />} />
      <Route path='/login' element={ < Home />} />
      <Route path='/signup'element={ <SignUp />} />
    </Routes>
  )
}
export default App
