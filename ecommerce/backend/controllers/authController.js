// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

function sign(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      const clash = exists.username === username ? "Username" : "Email";
      return res.status(409).json({ success: false, message: `${clash} is already taken.` });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: hash,
      role: "customer"
    });

    res.status(201).json({ 
      success: true, 
      message: "Account created!", 
      token: sign(user), 
      user 
    });
  } catch (e) {
    console.error("register:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: "Incorrect username or password." });

    res.json({ 
      success: true, 
      message: "Login successful!", 
      token: sign(user), 
      user 
    });
  } catch (e) {
    console.error("login:", e);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// OAuth Callback (Google/GitHub)
exports.oauthCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth.html?error=OAuth failed");
    }

    const token = sign(req.user);
    // User toJSON will handle cleaning sensitive data
    const userData = encodeURIComponent(JSON.stringify(req.user));
    
    res.redirect(`/?auth_token=${token}&auth_user=${userData}`);
  } catch (e) {
    console.error("oauthCallback:", e);
    res.redirect("/auth.html?error=Server error during OAuth");
  }
};