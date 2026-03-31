// controllers/cartController.js
const Cart = require("../models/Cart");

// GET /api/cart — get the logged-in user's saved cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    res.json({ success: true, items: cart ? cart.items : [] });
  } catch (e) {
    console.error("getCart:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/cart — save / overwrite the user's cart
exports.saveCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "items must be an array." });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, items, updatedAt: Date.now() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, items: cart.items });
  } catch (e) {
    console.error("saveCart:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// DELETE /api/cart — clear the user's cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], updatedAt: Date.now() }
    );
    res.json({ success: true, message: "Cart cleared." });
  } catch (e) {
    console.error("clearCart:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
