// routes/contact.js
const r    = require("express").Router();
const c    = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/auth");
const { body } = require("express-validator");
const v    = require("../middleware/validate");

r.post("/",
  [body("full_name").trim().isLength({min:2}).withMessage("Name required."),
   body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
   body("subject").trim().isLength({min:3}).withMessage("Subject required."),
   body("message").trim().isLength({min:15}).withMessage("Message min 15 chars.")],
  v, c.send);

r.get("/",            protect, adminOnly, c.getAll);
r.patch("/:id/read",  protect, adminOnly, c.markRead);
r.delete("/:id",      protect, adminOnly, c.remove);

module.exports = r;
