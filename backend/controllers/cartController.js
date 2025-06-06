import CartItem from "../modals/cartModal.js"; // Use modals, not models
import asyncHandler from "express-async-handler";

// Get cart items
export const getCartItems = asyncHandler(async (req, res) => {
  try {
    // Add authentication check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const cartItems = await CartItem.find({ user: req.user._id })
      .populate('item')
      .lean();

    if (!cartItems || cartItems.length === 0) {
      return res.json({
        success: true,
        cartItems: []
      });
    }

    const formattedItems = cartItems.map(item => {
      // Safety check for populated item
      if (!item.item) {
        console.warn('Cart item missing populated item data:', item._id);
        return null;
      }

      return {
        _id: item._id.toString(),
        itemId: item.item._id,
        item: {
          _id: item.item._id,
          name: item.item.name || 'Unknown Item',
          price: item.item.price || 0,
          imageUrl: item.item.imageUrl || null
        },
        quantity: item.quantity || 1
      };
    }).filter(Boolean); // Remove null entries

    res.json({
      success: true,
      cartItems: formattedItems
    });
  } catch (error) {
    console.error('GetCartItems Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart items',
      error: error.message
    });
  }
});

// Add to cart - Enhanced version with better error handling
export const addToCart = asyncHandler(async (req, res) => {
  const { itemId, quantity = 1 } = req.body;

  // Authentication check
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!itemId) {
    return res.status(400).json({
      success: false,
      message: 'Item ID is required'
    });
  }

  const qty = Math.max(1, Number(quantity));

  try {
    let cartItem = await CartItem.findOne({
      user: req.user._id,
      item: itemId
    });

    if (cartItem) {
      cartItem.quantity = qty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        user: req.user._id,
        item: itemId,
        quantity: qty
      });
    }

    await cartItem.populate('item');

    // Safety check for populated item
    if (!cartItem.item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or has been deleted'
      });
    }

    res.status(200).json({
      success: true,
      _id: cartItem._id.toString(),
      itemId: cartItem.item._id,
      item: {
        _id: cartItem.item._id,
        name: cartItem.item.name,
        price: cartItem.item.price,
        imageUrl: cartItem.item.imageUrl
      },
      quantity: cartItem.quantity
    });
  } catch (error) {
    console.error('AddToCart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  // Authentication check
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  try {
    const cartItem = await CartItem.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cartItem.quantity = Math.max(1, Number(quantity));
    await cartItem.save();
    await cartItem.populate('item');

    // Safety check for populated item
    if (!cartItem.item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or has been deleted'
      });
    }

    res.json({
      success: true,
      _id: cartItem._id.toString(),
      itemId: cartItem.item._id,
      item: {
        _id: cartItem.item._id,
        name: cartItem.item.name,
        price: cartItem.item.price,
        imageUrl: cartItem.item.imageUrl
      },
      quantity: cartItem.quantity,
    });
  } catch (error) {
    console.error('UpdateCartItem Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message
    });
  }
});

// Delete a cart item
export const deleteCartItem = asyncHandler(async (req, res) => {
  // Authentication check
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  try {
    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.deleteOne();
    
    res.status(200).json({ 
      success: true,
      _id: req.params.id, 
      message: 'Cart item deleted successfully' 
    });
  } catch (error) {
    console.error('DeleteCartItem Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cart item',
      error: error.message
    });
  }
});

// Clear cart function to empty the cart
export const clearCart = asyncHandler(async (req, res) => {
  // Authentication check
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  try {
    const result = await CartItem.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('ClearCart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});