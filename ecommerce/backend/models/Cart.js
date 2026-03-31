// models/Cart.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  id:    { type: String, required: true },   // product ID (string)
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  qty:   { type: Number, required: true, min: 1, default: 1 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
