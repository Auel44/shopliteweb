// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");

const products = [
  {
    name: 'Premium Wireless Headphones',
    category: 'electronics',
    price: 89.99,
    original_price: 129.99,
    image: 'images/headphones.jpg',
    description: 'Experience crystal-clear audio with our premium wireless headphones. Featuring 40-hour battery life, active noise cancellation, and ultra-comfortable ear cushions for all-day wear.',
    stock: 15,
    rating: 4.8,
    reviews: 124,
    featured: true
  },
  {
    name: 'Smart Fitness Watch',
    category: 'electronics',
    price: 149.99,
    original_price: 199.99,
    image: 'images/watch.jpg',
    description: 'Track your health and fitness goals with our advanced smart watch. Heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life packed in a sleek design.',
    stock: 10,
    rating: 4.7,
    reviews: 89,
    featured: true
  },
  {
    name: 'Minimalist Leather Wallet',
    category: 'accessories',
    price: 34.99,
    original_price: 49.99,
    image: 'images/wallet.jpg',
    description: 'Slim, stylish genuine leather wallet with RFID blocking technology. Holds up to 8 cards with a dedicated cash slot and ID window. Available in black and brown.',
    stock: 30,
    rating: 4.6,
    reviews: 212,
    featured: true
  },
  {
    name: 'Portable Bluetooth Speaker',
    category: 'electronics',
    price: 59.99,
    original_price: 79.99,
    image: 'images/speaker.jpg',
    description: 'Take your music anywhere with 360 surround sound. Waterproof IPX7 rating, 20-hour playtime, and a compact design that fits in any bag.',
    stock: 20,
    rating: 4.5,
    reviews: 167,
    featured: true
  },
  {
    name: 'Classic Ceramic Coffee Mug',
    category: 'home',
    price: 18.99,
    original_price: 24.99,
    image: 'images/mug.jpg',
    description: 'Start your mornings right with this handcrafted ceramic mug. Holds 12oz, dishwasher safe, and available in 5 beautiful colors.',
    stock: 50,
    rating: 4.9,
    reviews: 345,
    featured: false
  },
  {
    name: 'Ergonomic Office Chair',
    category: 'home',
    price: 249.99,
    original_price: 329.99,
    image: 'images/chair.svg',
    description: 'Work in comfort all day long. Adjustable lumbar support, breathable mesh back, armrests, and a 5-year warranty.',
    stock: 8,
    rating: 4.6,
    reviews: 78,
    featured: false
  },
  {
    name: 'Mens Casual Sneakers',
    category: 'clothing',
    price: 64.99,
    original_price: 89.99,
    image: 'images/sneakers.svg',
    description: 'Lightweight, breathable sneakers with memory foam insoles for all-day comfort. Available in sizes 7-13. Machine washable.',
    stock: 25,
    rating: 4.4,
    reviews: 193,
    featured: false
  },
  {
    name: 'Stainless Steel Water Bottle',
    category: 'home',
    price: 24.99,
    original_price: 34.99,
    image: 'images/bottle.svg',
    description: 'Keep drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid, 32oz capacity.',
    stock: 40,
    rating: 4.8,
    reviews: 421,
    featured: false
  },
  {
    name: 'Silk Blend Scarf',
    category: 'clothing',
    price: 42.99,
    original_price: 59.99,
    image: 'images/scarf.svg',
    description: 'Luxuriously soft silk blend scarf with elegant floral pattern. Lightweight, versatile styling for any season.',
    stock: 18,
    rating: 4.5,
    reviews: 64,
    featured: false
  },
  {
    name: 'Wireless Phone Charger',
    category: 'electronics',
    price: 29.99,
    original_price: 44.99,
    image: 'images/charger.svg',
    description: 'Fast 15W wireless charging pad compatible with all Qi-enabled devices. Ultra-slim profile with foreign object detection.',
    stock: 35,
    rating: 4.3,
    reviews: 156,
    featured: false
  },
  {
    name: 'Scented Soy Candle Set',
    category: 'home',
    price: 36.99,
    original_price: 49.99,
    image: 'images/candles.svg',
    description: 'Set of 4 hand-poured soy wax candles: Lavender, Vanilla Bean, Sandalwood, and Fresh Linen. Up to 45 hours burn time each.',
    stock: 22,
    rating: 4.7,
    reviews: 287,
    featured: false
  },
  {
    name: 'Vintage Leather Backpack',
    category: 'accessories',
    price: 119.99,
    original_price: 159.99,
    image: 'images/backpack.svg',
    description: 'Handcrafted full-grain leather backpack with padded laptop compartment, multiple organizer pockets, and adjustable shoulder straps.',
    stock: 12,
    rating: 4.8,
    reviews: 102,
    featured: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing data.");

    // Create admin user
    const adminHash = await bcrypt.hash("admin123", 12);
    await User.create({
      username: "admin",
      email: "admin@shoplite.com",
      password: adminHash,
      role: "admin"
    });
    console.log("Admin user created.");

    // Create products
    await Product.insertMany(products);
    console.log(`${products.length} products inserted.`);

    console.log("Seeding complete! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDB();
