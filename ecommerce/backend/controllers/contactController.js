// controllers/contactController.js
const ContactMessage = require("../models/ContactMessage");

// POST /api/contact
exports.send = async (req, res) => {
  try {
    const { full_name, email, subject, message } = req.body;
    await ContactMessage.create({ full_name, email, subject, message });
    res.status(201).json({ success: true, message: "Message received! We'll reply within 24 hours." });
  } catch (e) {
    console.error("sendContact:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/contact  (admin)
exports.getAll = async (req, res) => {
  try {
    const { is_read, page = 1, limit = 20 } = req.query;
    let query = {};
    if (is_read !== undefined) query.is_read = (is_read === "true");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const unread = await ContactMessage.countDocuments({ is_read: false });
    res.json({ success: true, unread, messages });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/contact/:id/read  (admin)
exports.markRead = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { is_read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: "Message not found." });
    res.json({ success: true, message: "Marked as read." });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// DELETE /api/contact/:id  (admin)
exports.remove = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found." });
    res.json({ success: true, message: "Message deleted." });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

