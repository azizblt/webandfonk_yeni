const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
}, {
  timestamps: true
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;

