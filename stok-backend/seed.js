require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Stock = require('./models/Stock');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB bağlantısı sağlandı, seed başlıyor...');

  // Admin kullanıcısını kontrol edelim
  const adminExists = await User.findOne({ username: 'rasit' });
  if (!adminExists) {
    await User.create({
      username: 'rasit',
      password: 'rasit123',
      email: 'rasit@example.com',
      role: 'admin',
      isActive: true,
    });
    console.log('Admin kullanıcısı oluşturuldu: rasit / rasit123');
  } else {
    console.log('rasit adlı admin kullanıcısı zaten mevcut.');
  }

  // Normal kullanıcı ekle
  const userExists = await User.findOne({ username: 'user' });
  if (!userExists) {
    await User.create({
      username: 'user',
      password: 'user123',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
    });
    console.log('Normal kullanıcı oluşturuldu: user / user123');
  } else {
    console.log('user adlı normal kullanıcı zaten mevcut.');
  }

  // Tüm stokları sil
  await Stock.deleteMany({});
  console.log('Tüm stoklar silindi.');

  // Stok verisi ekle (unit ile birlikte)
  const stockData = [
    { name: 'Ürün A', quantity: 100, unit: 'adet' },
    { name: 'Ürün B', quantity: 200, unit: 'kg' },
    { name: 'Ürün C', quantity: 50, unit: 'paket' },
  ];

  for (const stock of stockData) {
    await Stock.create(stock);
    console.log(`Stok eklendi: ${stock.name}`);
  }

  mongoose.disconnect();
  console.log('Seed tamamlandı, bağlantı kesildi.');
}

seed().catch(err => {
  console.error('Seed hatası:', err);
  mongoose.disconnect();
});
