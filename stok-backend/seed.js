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
      password: 'admin123',  // Geliştirme aşamasında düz şifre
      email: 'rasit@example.com',
      role: 'admin',
      isActive: true,
    });
    console.log('Admin kullanıcısı oluşturuldu: rasit / admin123');
  } else {
    console.log('rasit adlı admin kullanıcısı zaten mevcut.');
  }

  // Stok verisi ekleyelim
  const stockData = [
    { name: 'Ürün A', quantity: 100 },
    { name: 'Ürün B', quantity: 200 },
  ];

  for (const stock of stockData) {
    const existingStock = await Stock.findOne({ name: stock.name });
    if (!existingStock) {
      await Stock.create(stock);
      console.log(`Stok eklendi: ${stock.name}`);
    } else {
      console.log(`Stok zaten mevcut: ${stock.name}`);
    }
  }

  mongoose.disconnect();
  console.log('Seed tamamlandı, bağlantı kesildi.');
}

seed().catch(err => {
  console.error('Seed hatası:', err);
  mongoose.disconnect();
});
