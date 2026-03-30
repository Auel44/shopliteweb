// routes/admin.js
const r    = require("express").Router();
const c    = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

r.use(protect, adminOnly); // all admin routes require auth + admin role

r.get("/stats",            c.getStats);
r.get("/users",            c.getUsers);
r.patch("/users/:id/role", c.setRole);

module.exports = r;
