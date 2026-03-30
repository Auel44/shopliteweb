// controllers/productController.js
const Product = require("../models/Product");

// GET /api/products  ?cat=&search=&featured=true
exports.getAll = async (req, res) => {
  try {
    const { cat, search, featured } = req.query;
    let query = {};

    if (cat && cat !== "all") {
      query.category = cat;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (featured === "true") {
      query.featured = true;
    }

    const products = await Product.find(query).sort({ featured: -1, _id: 1 });
    res.json({ success: true, count: products.length, products });
  } catch (e) {
    console.error("getAllProducts:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/products/:id
exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/products  (admin)
exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (e) {
    console.error("createProduct:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/products/:id  (admin)
exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// DELETE /api/products/:id  (admin)
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, message: "Product deleted." });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

