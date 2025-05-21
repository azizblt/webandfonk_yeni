const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  quantity:  { type: Number, required: true, min: 0 },
  unit:      { type: String, required: true, enum: ['adet', 'kg', 'litre', 'metre', 'paket'] },
  imageUrl:  { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
