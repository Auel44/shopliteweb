// routes/products.js
const r    = require("express").Router();
const c    = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");
const { body } = require("express-validator");
const v    = require("../middleware/validate");

const rules = [
  body("name").notEmpty().withMessage("Name required."),
  body("category").isIn(["electronics","clothing","home","accessories"]).withMessage("Invalid category."),
  body("price").isFloat({gt:0}).withMessage("Price must be positive."),
  body("stock").isInt({min:0}).withMessage("Stock must be >= 0."),
];

r.get("/",       c.getAll);
r.get("/:id",    c.getOne);
r.post("/",      protect, adminOnly, rules, v, c.create);
r.put("/:id",    protect, adminOnly, c.update);
r.delete("/:id", protect, adminOnly, c.remove);

module.exports = r;
