const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  invoiceNo: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema); 