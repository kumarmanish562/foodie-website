import React from 'react'
import { Route, Routes} from 'react-router-dom'
import AddItems from './component/AddItems'
import List from './component/List'
import Order from './component/Order'
import Navbar from './component/Navbar'

const App = () => {
  return (
 <>
 <Navbar />
 <Routes>
  <Route path='/' element={<AddItems/>} />
  <Route path='/list' element={<List/>} />
  <Route path='/orders' element={<Order/>} />
 </Routes></>
  )
}

export default App