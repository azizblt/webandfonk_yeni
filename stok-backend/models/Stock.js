const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  quantity:  { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
