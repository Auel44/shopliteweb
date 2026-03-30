// controllers/orderController.js
const mongoose = require("mongoose");
const Order    = require("../models/Order");
const Product  = require("../models/Product");

const FREE_SHIP = 50;
const SHIP_COST = 9.99;

// POST /api/orders
exports.placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { full_name, email, phone, address, items } = req.body;

    if (!items?.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const p = await Product.findById(item.product_id).session(session);
      if (!p) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `Product ID ${item.product_id} not found.` });
      }
      if (p.stock < item.qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `Insufficient stock for "${p.name}" (${p.stock} left).` });
      }
      
      subtotal += p.price * item.qty;
      orderItems.push({
        product_id: p._id,
        name: p.name,
        price: p.price,
        qty: item.qty
      });

      // Update stock
      p.stock -= item.qty;
      await p.save({ session });
    }

    const shipping = subtotal >= FREE_SHIP ? 0 : SHIP_COST;
    const total    = subtotal + shipping;
    const orderRef = "G63-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    const userId   = req.user?.id || null;

    const order = await Order.create([{
      order_ref: orderRef,
      user_id: userId,
      full_name,
      email,
      phone,
      address,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      items: orderItems
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order placed!",
      order: order[0]
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    console.error("placeOrder:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/orders  (own orders — must be logged in)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/orders/all  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .populate("user_id", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, total, page: parseInt(page), orders });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/orders/:id/status  (admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status." });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    
    res.json({ success: true, message: `Order marked as ${status}.` });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/orders/:ref
exports.getByRef = async (req, res) => {
  try {
    const order = await Order.findOne({ order_ref: req.params.ref });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

