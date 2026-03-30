// server.js — ShopLite API Entry Point
require("dotenv").config();
require("./config/db")();                   // connect on boot


const express   = require("express");
const helmet    = require("helmet");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");

const path    = require("path");
const passport = require("./config/passport");
const session  = require("express-session");
const app     = express();
const PORT    = process.env.PORT || 5000;

// ── Static Files ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..")));

// ── Security headers ─────────────────────────────────────
// Note: Adjusted Helmet to allow the frontend to function correctly
app.use(helmet({
  contentSecurityPolicy: false, 
}));


// ── CORS ─────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin))
      return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
}));

// ── Body parsers ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Sessions ─────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || "shoplite-secret-g63",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Rate limiting ─────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 300,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: "Too many requests — try again later." },
}));

// Stricter limit on auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30,
  message: { success: false, message: "Too many auth attempts — wait 15 minutes." },
});

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",     authLimiter, require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/contact",  require("./routes/contact"));
app.use("/api/admin",    require("./routes/admin"));

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "ShopLite API running 🚀", time: new Date() })
);

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found." })
);

// ── Global error handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`\n🚀  ShopLite API  →  http://localhost:${PORT}/api`);
  console.log(`🌍  Env: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️   DB : MongoDB Atlas Cluster\n`);

});