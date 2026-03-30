// controllers/adminController.js
const Order          = require("../models/Order");
const User           = require("../models/User");
const Product        = require("../models/Product");
const ContactMessage = require("../models/ContactMessage");

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    // Basic counts
    const totalOrders = await Order.countDocuments();
    const totalUsers  = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();
    const unreadMessages = await ContactMessage.countDocuments({ is_read: false });
    const lowStock = await Product.countDocuments({ stock: { $lte: 5 } });

    // Total Revenue
    const revenueStats = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    // Revenue last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const revenueByDay = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "cancelled" }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { day: "$_id", revenue: 1, _id: 0 } }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);

    // Top 5 products by qty sold
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_id",
          name: { $first: "$items.name" },
          sold: { $sum: "$items.qty" }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      { $project: { name: 1, sold: 1, _id: 0 } }
    ]);

    // Recent 10 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("order_ref full_name total status createdAt");

    res.json({
      success: true,
      stats: { totalRevenue, totalOrders, totalUsers, totalProducts, unreadMessages, lowStock },
      revenueByDay,
      ordersByStatus,
      topProducts,
      recentOrders,
    });
  } catch (e) {
    console.error("getStats:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select("username email role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, total, users });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/admin/users/:id/role
exports.setRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "admin"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role." });
    
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    
    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

