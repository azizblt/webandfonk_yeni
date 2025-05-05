const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action:      { type: String, required: true }, // örn: 'Stok Ekleme', 'Kullanıcı Girişi'
  details:     { type: String },
  username:    { type: String },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
