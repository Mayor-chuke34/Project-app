const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  address: { type: String },
  isAdmin: { type: Boolean, default: false }, // New field for admin users
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
