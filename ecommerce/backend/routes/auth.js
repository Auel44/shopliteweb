// routes/auth.js
const r    = require("express").Router();
const c    = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { body } = require("express-validator");
const v    = require("../middleware/validate");
const passport = require("passport");

const FRONTEND_URL = process.env.FRONTEND_URL || "https://shopliteweb.pages.dev";

r.post("/register",
  [body("username").trim().isLength({min:3}).withMessage("Username must be at least 3 chars."),
   body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
   body("password").isLength({min:6}).withMessage("Password min 6 chars.")],
  v, c.register);

r.post("/login",
  [body("username").notEmpty().withMessage("Username required."),
   body("password").notEmpty().withMessage("Password required.")],
  v, c.login);

r.get("/me", protect, c.getMe);

// ── OAuth Routes ─────────────────────────────────────────
r.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
r.get("/google/callback", passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/auth.html` }), c.oauthCallback);

r.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
r.get("/github/callback", passport.authenticate("github", { failureRedirect: `${FRONTEND_URL}/auth.html` }), c.oauthCallback);

module.exports = r;
