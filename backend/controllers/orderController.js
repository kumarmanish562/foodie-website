import Order from "../modals/orderModal.js"; // Use modals, not models
import Stripe from "stripe";
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get Orders - Enhanced version with better error handling
export const getOrders = async (req, res) => {
  try {
    // Authentication check
    if (!req.user || !req.user._id) {
      console.error('Authentication failed - no user in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Fetching orders for user:', req.user._id);

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.item')
      .lean();

    console.log('Found orders:', orders.length);

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        orders: []
      });
    }

    // Format response to match frontend expectations
    const formattedOrders = orders.map(order => {
      try {
        return {
          _id: order._id,
          customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'N/A',
          firstName: order.firstName || '',
          lastName: order.lastName || '',
          phone: order.phone || '',
          email: order.email || '',
          address: order.address || '',
          city: order.city || '',
          zipCode: order.zipcode || '',
          paymentMethod: order.paymentMethod || 'unknown',
          paymentStatus: order.paymentStatus || 'pending',
          status: order.status || 'pending',
          totalAmount: order.total || 0,
          createdAt: order.createdAt,
          items: (order.items || []).map(item => {
            if (!item) return null;

            return {
              _id: item._id || `temp-${Math.random()}`,
              item: {
                _id: item.item?._id || item.item || 'unknown',
                name: item.name || item.item?.name || 'Unknown Item',
                price: item.price || item.item?.price || 0,
                imageUrl: item.imageUrl || item.item?.imageUrl || null
              },
              quantity: item.quantity || 1
            };
          }).filter(Boolean) // Remove null entries
        };
      } catch (formatError) {
        console.error('Error formatting order:', order._id, formatError);
        return null;
      }
    }).filter(Boolean); // Remove null entries

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('GetOrders Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
};

// Create Order - Enhanced version
export const createOrder = async (req, res) => {
  try {
    // Authentication check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipcode,
      paymentMethod,
      subtotal,
      tax,
      total,
      items
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or empty items array" 
      });
    }

    // Enhanced item mapping with better error handling
    const orderItems = items.map((itemData) => {
      try {
        // Handle different item data structures
        const item = itemData.item || itemData;
        const itemId = typeof item === 'object' ? (item._id || item.id) : item;
        
        return {
          item: itemId,
          name: itemData.name || item?.name || 'Unknown Item',
          price: Number(itemData.price || item?.price || 0),
          imageUrl: itemData.imageUrl || item?.imageUrl || null,
          quantity: Number(itemData.quantity || 1)
        };
      } catch (error) {
        console.error('Error processing item:', itemData, error);
        throw new Error(`Invalid item data: ${error.message}`);
      }
    });

    const shippingCost = 0;
    const totalAmount = Number(total) || orderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    if (paymentMethod === 'online') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: orderItems.map(item => ({
          price_data: {
            currency: 'inr',
            product_data: { 
              name: item.name,
              images: item.imageUrl ? [`${process.env.BACKEND_URL}/uploads/${item.imageUrl}`] : []
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity
        })),
        customer_email: email,
        success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
        metadata: { 
          firstName, 
          lastName, 
          email, 
          phone,
          userId: req.user._id.toString()
        }
      });

      const newOrder = new Order({
        user: req.user._id,
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        zipcode,
        paymentMethod,
        subtotal: Number(subtotal),
        tax: Number(tax),
        total: totalAmount,
        shipping: shippingCost,
        items: orderItems,
        paymentStatus: 'pending',
        status: 'processing',
        sessionId: session.id
      });

      await newOrder.save();

      return res.status(201).json({
        success: true,
        sessionUrl: session.url,
        orderId: newOrder._id,
        sessionId: session.id
      });
    }

    // Cash on Delivery
    const newOrder = new Order({
      user: req.user._id,
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipcode,
      paymentMethod,
      subtotal: Number(subtotal),
      tax: Number(tax),
      total: totalAmount,
      shipping: shippingCost,
      items: orderItems,
      paymentStatus: 'pending',
      status: 'confirmed'
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    });

  } catch (error) {
    console.error('CreateOrder Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create order',
      error: error.message 
    });
  }
};

// Confirm Payment - Enhanced version
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Session ID required' 
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const order = await Order.findOneAndUpdate(
        { sessionId: session_id },
        { 
          paymentStatus: 'succeeded',
          status: 'confirmed' 
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ 
          success: false,
          message: 'Order not found' 
        });
      }

      return res.json({
        success: true,
        message: 'Payment confirmed successfully',
        order
      });
    }

    return res.status(400).json({ 
      success: false,
      message: 'Payment not completed' 
    });
  } catch (error) {
    console.error('ConfirmPayment Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment confirmation failed',
      error: error.message 
    });
  }
};
