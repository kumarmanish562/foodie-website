import express from 'express';
import {
  getCart,
  addTocart,
  clearCart,
  deleteCartItem,
  updateCartItem
} from '../controllers/cartController.js';
import authMiddleWare from '../middleware/auth.js';

const router = express.Router();

// Routes for cart
router
  .route('/')
  .get(authMiddleWare, getCart)
  .post(authMiddleWare, addTocart);

// Route to clear the entire cart
router.post('/clear', authMiddleWare, clearCart);

// Routes for individual cart items
router
  .route('/:id')
  .put(authMiddleWare, updateCartItem)
  .delete(authMiddleWare, deleteCartItem);

export default router;
