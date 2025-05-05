require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcryptjs modülünü import et
const User = require('./models/User');
const Stock = require('./models/Stock');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB bağlantısı sağlandı, seed başlıyor...');

    // Admin kullanıcısını ekleyelim
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('rasit123', 10); // şifreyi hashle

      await User.create({
        username: 'rasit',
        password: hashedPassword, // hash'lenmiş şifreyi kullan
        role: 'admin',
      });
      console.log('Admin kullanıcısı oluşturuldu: rasit / rasit123');
    } else {
      console.log('Zaten bir admin kullanıcısı mevcut.');
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
  } catch (err) {
    console.error('Seed hatası:', err);
    mongoose.disconnect();
  }
}

seed();
