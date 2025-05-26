import asyncHandler from 'express-async-handler'
import { CartItem } from "../modals/cartModal.js";



// Get Cart Items for Logged-in User
export const getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id }).populate('item')

  const formatted = items.map(ci => ({
    _id: ci._id.toString(),
    item: ci.item,
    quantity: ci.quantity,
  }))

  res.json(formatted)
})


// Add to cart function to add items to cart
export const addTocart = asyncHandler(async (req, res) => {
  const { itemId, quantity } = req.body;  

  if (!itemId || typeof quantity !== 'number') {
    res.status(400);
    throw new Error('itemId and quantity are required');
  }

  let cartItem = await CartItem.findOne({ user: req.user._id, item: itemId });

  if (cartItem) {
    cartItem.quantity = Math.max(1, cartItem.quantity + quantity);

    if (cartItem.quantity < 1) {
      await cartItem.remove();
      return res.json({
        _id: cartItem._id.toString(),
        item: cartItem.item,
        quantity: 0,
      });
    }

    await cartItem.save();
    await cartItem.populate('item');
    return res.status(200).json({
      _id: cartItem._id.toString(),
      item: cartItem.item,
      quantity: cartItem.quantity,
    });
  }

  cartItem = await CartItem.create({
    user: req.user._id,
    item: itemId,
    quantity,
  });

  await cartItem.populate('item');
  res.status(200).json({
    _id: cartItem._id.toString(),
    item: cartItem.item,
    quantity: cartItem.quantity,
  });
});
    

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cartItem = await CartItem.findOne({ _id: req.params.id, user: req.user._id });

  if (!cartItem) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  cartItem.quantity = Math.max(1, quantity);
  await cartItem.save();
  await cartItem.populate('item');

  res.json({
    _id: cartItem._id.toString(),
    item: cartItem.item,
    quantity: cartItem.quantity,
  });
});


// Delete a cart item
export const deleteCartItem = asyncHandler(async (req, res) => {
  const cartItem = await CartItem.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!cartItem) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  await cartItem.deleteOne();
  res.status(200).json({ _id: req.params.id, message: 'Cart item deleted successfully' });
});

//clear cart function to empty the cart
export const clearCart = asyncHandler(async (req, res) => {
  const result = await CartItem.deleteMany({ user: req.user._id });

  res.status(200).json({
    message: 'Cart cleared successfully',
    deletedCount: result.deletedCount,
  });
});

// export const clearCart = asyncHandler(async (req, res) => {
//   await CartItem.deleteMany({ user: req.user._id });
//   res.json({ message: 'cart claer'})
// })