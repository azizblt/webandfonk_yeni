const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Models
const Log = require('./models/Log');
const User = require('./models/User');
const Stock = require('./models/Stock');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Giriş API'si
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (user) {
    // Admin kullanıcıya log ekleyelim
    await Log.create({
      action: 'Kullanıcı Girişi',
      details: `${username} giriş yaptı.`,
      username: username,
    });

    res.status(200).json({ message: 'Giriş başarılı' });
  } else {
    res.status(401).json({ message: 'Hatalı kullanıcı adı veya şifre' });
  }
});

// Stokları Listele
app.get('/stocks', async (req, res) => {
  const stocks = await Stock.find();
  res.json(stocks);
});

// Yeni Stok Ekle
app.post('/stocks', async (req, res) => {
  const { name, quantity, username } = req.body;
  const newStock = new Stock({ name, quantity });
  await newStock.save();

  // Log ekleyelim
  await Log.create({
    action: 'Stok Ekleme',
    details: `${quantity} adet ${name} eklendi.`,
    username: username || 'bilinmeyen',
  });

  res.json({ message: 'Stok eklendi' });
});

// Stok Sil
app.delete('/stocks/:id', async (req, res) => {
  const deletedStock = await Stock.findByIdAndDelete(req.params.id);

  // Log ekleyelim
  await Log.create({
    action: 'Stok Silme',
    details: `${deletedStock?.name || 'Stok'} silindi.`,
    username: req.body.username || 'bilinmeyen',
  });

  res.json({ message: 'Stok silindi' });
});

// Tüm Logları Getir (Admin'e özel)
app.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Loglar çekilemedi:', err);
    res.status(500).json({ message: 'Loglar getirilemedi.' });
  }
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
