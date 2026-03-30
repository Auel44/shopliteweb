// models/ContactMessage.js
const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

contactMessageSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
module.exports = ContactMessage;
