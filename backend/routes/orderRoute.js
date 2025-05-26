import express from 'express'
import {  confirmPayment, createOrder, getAllOrders, getOrderById, getOrders, updateAnyOrder, updateOrder, } from '../controllers/orderController.js'

const orderRouter = express.Router()


orderRouter.get ('/getall', getAllOrders)
orderRouter.put('/getall/:id', updateAnyOrder)

//protexct rest of routes using middleware

orderRouter.post('/', createOrder)
orderRouter.get('/', getOrders)
orderRouter.get('/confirm', confirmPayment);
orderRouter.get('/:id', getOrderById);
orderRouter.put('/:id', updateOrder);


export default orderRouter