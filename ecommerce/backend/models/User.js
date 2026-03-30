// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: false, // Optional for social login users
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null/missing values
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Avoid returning password in JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
