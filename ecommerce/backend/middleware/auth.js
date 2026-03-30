// middleware/auth.js
const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "No token — please log in." });

  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch (e) {
    const msg = e.name === "TokenExpiredError"
      ? "Session expired — please log in again."
      : "Invalid token — please log in.";
    res.status(401).json({ success: false, message: msg });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin access required." });
  next();
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try { req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET); } catch (_) {}
  }
  next();
}

module.exports = { protect, adminOnly, optionalAuth };