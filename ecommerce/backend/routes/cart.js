// routes/cart.js
const r = require("express").Router();
const c = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

r.get("/",    protect, c.getCart);
r.put("/",    protect, c.saveCart);
r.delete("/", protect, c.clearCart);

module.exports = r;
