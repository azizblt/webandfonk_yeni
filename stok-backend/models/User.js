const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  role:       { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive:   { type: Boolean, default: true },
  isFirstAdmin: { type: Boolean, default: false },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
