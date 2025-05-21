const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  buyerName: { type: String, required: true },
  buyerTaxNo: { type: String },
  sellerName: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  isInvoiced: { type: Boolean, default: false }
});

module.exports = mongoose.model('Sale', saleSchema); 