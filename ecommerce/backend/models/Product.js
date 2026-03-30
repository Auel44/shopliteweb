// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["electronics", "clothing", "home", "accessories"]
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  original_price: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: "images/placeholder.jpg"
  },
  description: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Virtual for ID to maintain compatibility with frontend
productSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
