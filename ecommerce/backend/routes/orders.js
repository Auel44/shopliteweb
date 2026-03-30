// routes/orders.js
const r    = require("express").Router();
const c    = require("../controllers/orderController");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");
const { body } = require("express-validator");
const v    = require("../middleware/validate");

const rules = [
  body("full_name").trim().isLength({min:2}).withMessage("Full name required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("phone").matches(/^[\d\s\+\-\(\)]{7,15}$/).withMessage("Valid phone required."),
  body("address").trim().isLength({min:8}).withMessage("Full address required."),
  body("items").isArray({min:1}).withMessage("Cart cannot be empty."),
  body("items.*.product_id").isMongoId().withMessage("Invalid product ID."),
  body("items.*.qty").isInt({gt:0}).withMessage("Qty must be >= 1."),
];

r.post("/",           optionalAuth, rules, v, c.placeOrder);
r.get("/",            protect, c.getMyOrders);
r.get("/all",         protect, adminOnly, c.getAllOrders);
r.get("/:ref",        c.getByRef);
r.patch("/:id/status",protect, adminOnly, c.updateStatus);

module.exports = r;
