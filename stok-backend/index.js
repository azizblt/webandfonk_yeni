const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const pdf = require('html-pdf');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const { startOfWeek, startOfMonth, endOfWeek, endOfMonth } = require('date-fns');
const eFaturaRoutes = require('./routes/eFaturaRoutes');

// Models
const Log = require('./models/Log');
const User = require('./models/User');
const Stock = require('./models/Stock');
const Sale = require('./models/Sale');
const Invoice = require('./models/Invoice');

const app = express();
app.use(cors());
app.use(express.json());

// Statik dosya servis etme ayarları
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// E-Fatura route'larını ekle
app.use('/api/e-fatura', eFaturaRoutes);

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Giriş API'si
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Gelen login isteği:', { username, password });
  const user = await User.findOne({ username, password });
  console.log('Veritabanında bulunan kullanıcı:', user);

  if (user) {
    // Admin kullanıcıya log ekleyelim
    await Log.create({
      action: 'Kullanıcı Girişi',
      details: `${username} giriş yaptı.`,
      username: username,
    });

    res.status(200).json({ 
      message: 'Giriş başarılı',
      role: user.role,
      username: user.username
    });
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
  const { name, quantity, imageUrl, username } = req.body;
  const newStock = new Stock({ name, quantity, imageUrl });
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

// Stok Güncelle
app.put('/stocks/:id', async (req, res) => {
  try {
    const { name, quantity, imageUrl } = req.body;
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      { name, quantity, imageUrl },
      { new: true }
    );

    if (!updatedStock) {
      return res.status(404).json({ message: 'Stok bulunamadı' });
    }

    // Log ekleyelim
    await Log.create({
      action: 'Stok Güncelleme',
      details: `${quantity} adet ${name} güncellendi.`,
      username: req.body.username || 'bilinmeyen',
    });

    res.json({ message: 'Stok güncellendi', stock: updatedStock });
  } catch (err) {
    res.status(500).json({ message: 'Stok güncellenirken bir hata oluştu' });
  }
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

// Satış ekle
app.post('/sales', async (req, res) => {
  const { stockId, productName, quantity, unitPrice, totalPrice, buyerName, buyerTaxNo, sellerName, sellerId } = req.body;
  const stock = await Stock.findById(stockId);
  if (!stock || stock.quantity < quantity) return res.status(400).json({ message: 'Yetersiz stok' });
  stock.quantity -= quantity;
  await stock.save();
  const sale = await Sale.create({ stockId, productName, quantity, unitPrice, totalPrice, buyerName, buyerTaxNo, sellerName, sellerId });
  // Satış logu ekle
  await Log.create({
    action: 'Satış',
    details: `${sellerName} tarafından ${quantity} adet/kilo ${productName} satıldı. Alıcı: ${buyerName}`,
    username: sellerName
  });
  res.json(sale);
});

// Satışları listele
app.get('/sales', async (req, res) => {
  const sales = await Sale.find().populate('stockId');
  res.json(sales);
});

// Fatura kes
app.post('/invoices', async (req, res) => {
  const { saleId } = req.body;
  const sale = await Sale.findById(saleId);
  if (!sale) return res.status(404).json({ message: 'Satış bulunamadı' });
  if (sale.isInvoiced) return res.status(400).json({ message: 'Bu satış için zaten fatura kesilmiş.' });
  const invoiceNo = 'FTR-' + Date.now();

  // e-Fatura için inputDocumentList hazırlama (örnek, gerçek entegrasyon için XML/JSON şeması dokümana göre uyarlanmalı)
  const inputDocumentList = [{
    invoiceNo,
    productName: sale.productName,
    quantity: sale.quantity,
    unitPrice: sale.unitPrice,
    totalPrice: sale.totalPrice,
    buyerName: sale.buyerName,
    buyerTaxNo: sale.buyerTaxNo,
    sellerName: sale.sellerName,
    date: new Date(),
  }];

  // e-Fatura servisine gönder
  try {
    const eFaturaService = require('./services/eFaturaService');
    const efaturaResult = await eFaturaService.sendInvoice(inputDocumentList);
    // Fatura kaydını oluştur
    const invoice = await Invoice.create({ saleId, invoiceNo });
    sale.isInvoiced = true;
    await sale.save();
    res.json({ invoice, efaturaResult });
  } catch (err) {
    res.status(500).json({ message: 'e-Fatura gönderilemedi', error: err.message });
  }
});

// Faturaları listele
app.get('/invoices', async (req, res) => {
  const invoices = await Invoice.find().populate('saleId');
  res.json(invoices);
});

async function getFaturaHtmlWithQR(fatura) {
  // QR kod verisi: UUID, toplam, tarih
  const qrData = JSON.stringify({ uuid: fatura.uuid, toplam: fatura.genelToplam, tarih: fatura.tarih });
  const qrImage = await QRCode.toDataURL(qrData);
  // Placeholder logo (örnek: GİB logosu base64 veya bir link)
  const logo = 'https://ivd.gib.gov.tr/images/logo.png';
  return `
    <html>
      <head>
        <meta charset='utf-8' />
        <title>e-Arşiv Fatura</title>
        <style>
          body { background: #222; color: #fff; font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .container { padding: 32px; }
          .row { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; }
          .box { border: 1px solid #888; padding: 16px; margin-bottom: 16px; background: #222; border-radius: 4px; min-width: 320px; }
          .logo { width: 90px; height: 90px; display: block; margin: 0 auto 8px auto; }
          .qr { background: #fff; padding: 8px; border-radius: 8px; }
          .summary-table { border-collapse: collapse; width: 320px; font-size: 14px; }
          .summary-table th, .summary-table td { border: 1px solid #888; padding: 6px 10px; text-align: left; }
          .summary-table th { background: #333; color: #fff; }
          .summary-table td { background: #222; color: #fff; }
          .ettn { font-size: 13px; margin-top: 8px; }
          .title { font-size: 28px; font-weight: bold; text-align: right; margin-bottom: 24px; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="row">
            <div style="flex:1;">
              <div class="box">
                <b>${fatura.satici.unvan}</b><br/>
                Kapı No: <br/>
                ${fatura.satici.adres}<br/>
                Tel: 05428106221 Fax:<br/>
                E-Posta: amuslu802@gmail.com<br/>
                Vergi Dairesi: KARABÜK VERGİ DAİRESİ<br/>
                TCKN: 41533908272
              </div>
              <div class="box">
                <b>SAYIN</b><br/>
                ${fatura.musteri.ad}<br/>
                No: <br/>
                ${fatura.musteri.adres}<br/>
                Vergi Dairesi: BOLU VERGİ DAİRESİ MÜD. VKN: ${fatura.musteri.vkn}
              </div>
            </div>
            <div style="flex:1; text-align:center;">
              <img src="${logo}" class="logo" />
            </div>
            <div style="flex:1; text-align:right;">
              <div class="title">e-Arşiv Fatura</div>
              <div class="qr"><img src='${qrImage}' width='120' height='120' /></div>
            </div>
          </div>
          <div class="row">
            <div style="flex:2;">
              <span class="ettn"><b>ETTN:</b> ${fatura.uuid}</span>
            </div>
            <div style="flex:1;">
              <table class="summary-table">
                <tr><th>Özelleştirme No:</th><td>TR1.2</td></tr>
                <tr><th>Senaryo:</th><td>EARSIVFATURA</td></tr>
                <tr><th>Fatura Tipi:</th><td>SATIS</td></tr>
                <tr><th>Fatura No:</th><td>${fatura.faturaNo}</td></tr>
                <tr><th>Fatura Tarihi:</th><td>${new Date(fatura.tarih).toLocaleString('tr-TR')}</td></tr>
                <tr><th>İrsaliye No:</th><td>1200</td></tr>
                <tr><th>İrsaliye Tarihi:</th><td>${new Date(fatura.tarih).toLocaleDateString('tr-TR')}</td></tr>
              </table>
            </div>
          </div>
          <div style="margin-top:32px;">
            <table style="width:100%; border-collapse:collapse; font-size:15px;">
              <thead>
                <tr style="background:#333; color:#fff;">
                  <th style="border:1px solid #888; padding:8px;">Ürün</th>
                  <th style="border:1px solid #888; padding:8px;">Miktar</th>
                  <th style="border:1px solid #888; padding:8px;">Birim</th>
                  <th style="border:1px solid #888; padding:8px;">Birim Fiyat</th>
                  <th style="border:1px solid #888; padding:8px;">KDV Oranı</th>
                  <th style="border:1px solid #888; padding:8px;">KDV Tutar</th>
                  <th style="border:1px solid #888; padding:8px;">Tutar</th>
                </tr>
              </thead>
              <tbody>
                ${fatura.urunler.map(u => `
                  <tr>
                    <td style="border:1px solid #888; padding:8px;">${u.ad}</td>
                    <td style="border:1px solid #888; padding:8px;">${u.miktar}</td>
                    <td style="border:1px solid #888; padding:8px;">${u.birim}</td>
                    <td style="border:1px solid #888; padding:8px;">${u.birimFiyat} TL</td>
                    <td style="border:1px solid #888; padding:8px;">${(u.kdvOrani * 100).toFixed(0)}%</td>
                    <td style="border:1px solid #888; padding:8px;">${u.kdvTutar} TL</td>
                    <td style="border:1px solid #888; padding:8px;">${u.tutar} TL</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="text-align:right; margin-top:16px; font-size:16px;">
              <b>Ara Toplam:</b> ${fatura.araToplam} TL<br/>
              <b>KDV Toplam:</b> ${fatura.kdvToplam} TL<br/>
              <b>Genel Toplam:</b> ${fatura.genelToplam} TL<br/>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Güncellenmiş endpoint (async!)
app.post('/create-fatura', async (req, res) => {
  const { musteri, urunler } = req.body;
  let araToplam = 0, kdvToplam = 0;

  const urunSatirlari = urunler.map(u => {
    const tutar = u.miktar * u.birimFiyat;
    const kdvTutar = tutar * u.kdvOrani;
    araToplam += tutar;
    kdvToplam += kdvTutar;
    return { ...u, tutar, kdvTutar };
  });

  const fatura = {
    faturaNo: 'FTR-' + Date.now(),
    uuid: uuidv4(),
    tarih: new Date().toISOString(),
    satici: {
      unvan: "MUSLU GIDA SAN. VE TIC. LTD. STI.",
      vkn: "1234567890",
      adres: "İstanbul Organize Sanayi Bölgesi, No: 123, İstanbul"
    },
    musteri,
    urunler: urunSatirlari,
    araToplam,
    kdvToplam,
    genelToplam: araToplam + kdvToplam
  };

  if (req.query.pdf === 'true') {
    const html = await getFaturaHtmlWithQR(fatura);
    pdf.create(html).toBuffer((err, buffer) => {
      if (err) return res.status(500).json({ error: 'PDF oluşturulamadı' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fatura.faturaNo}.pdf"`);
      res.send(buffer);
    });
  } else {
    res.json(fatura);
  }
});

// Resim yükleme endpoint'i
app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Dosya yüklenemedi' });
  }
  const imageUrl = `http://192.168.1.5:3000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Z raporu ve öneri API'si
app.get('/z-report', async (req, res) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Haftalık ve aylık faturalar (invoices üzerinden)
  const weeklyInvoices = await Invoice.find({ date: { $gte: weekStart, $lte: weekEnd } }).populate('saleId');
  const monthlyInvoices = await Invoice.find({ date: { $gte: monthStart, $lte: monthEnd } }).populate('saleId');

  // Haftalık ve aylık toplamlar
  const weeklyTotal = weeklyInvoices.reduce((sum, inv) => sum + (inv.saleId?.totalPrice || 0), 0);
  const monthlyTotal = monthlyInvoices.reduce((sum, inv) => sum + (inv.saleId?.totalPrice || 0), 0);

  // En çok satılan ürünler (aylık)
  const monthlySales = await Sale.find({ date: { $gte: monthStart, $lte: monthEnd } });
  const productMap = {};
  monthlySales.forEach(sale => {
    if (!productMap[sale.productName]) productMap[sale.productName] = 0;
    productMap[sale.productName] += sale.quantity;
  });
  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => ({ name, qty }));

  // Stoklar ve azalanlar
  const stocks = await Stock.find();
  const lowStocks = stocks.filter(s => s.quantity < 20).map(s => ({ name: s.name, quantity: s.quantity }));

  // Basit öneriler
  const suggestions = [];
  if (lowStocks.length > 0) {
    suggestions.push('Stok miktarı azalan ürünler: ' + lowStocks.map(s => `${s.name} (${s.quantity})`).join(', ') + '. Yeniden sipariş verin!');
  }
  if (topProducts.length > 0) {
    suggestions.push('Bu ay en çok satılan ürünler: ' + topProducts.map(p => `${p.name} (${p.qty})`).join(', ') + '. Stoklarınızı kontrol edin!');
  }
  if (weeklyTotal > 0) {
    suggestions.push('Bu hafta toplam satış: ' + weeklyTotal + ' TL.');
  }
  if (monthlyTotal > 0) {
    suggestions.push('Bu ay toplam satış: ' + monthlyTotal + ' TL.');
  }

  res.json({
    week: { start: weekStart, end: weekEnd, total: weeklyTotal, invoiceCount: weeklyInvoices.length },
    month: { start: monthStart, end: monthEnd, total: monthlyTotal, invoiceCount: monthlyInvoices.length },
    topProducts,
    lowStocks,
    suggestions
  });
});

// Kullanıcıları Listele (Admin'e özel)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Kullanıcılar getirilemedi' });
  }
});

// Yeni Kullanıcı Ekle (Admin'e özel)
app.post('/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const creator = req.body.username; // İşlemi yapan admin

    // Kullanıcı adı kontrolü
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    const newUser = new User({
      username,
      password,
      role,
      createdBy: creator
    });

    await newUser.save();

    // Log ekleyelim
    await Log.create({
      action: 'Kullanıcı Ekleme',
      details: `${role} rolünde ${username} kullanıcısı eklendi.`,
      username: creator
    });

    res.json({ message: 'Kullanıcı eklendi' });
  } catch (err) {
    res.status(500).json({ message: 'Kullanıcı eklenemedi' });
  }
});

// Kullanıcı Sil (Admin'e özel)
app.delete('/users/:id', async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // İlk admin hesabını silmeye çalışıyorsa engelle
    if (userToDelete.isFirstAdmin) {
      return res.status(403).json({ message: 'İlk admin hesabı silinemez' });
    }

    // Silme işlemini yapan kullanıcı admin mi kontrol et
    const currentUser = await User.findOne({ username: req.body.username });
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Log ekleyelim
    await Log.create({
      action: 'Kullanıcı Silme',
      details: `${userToDelete.username} kullanıcısı silindi.`,
      username: req.body.username
    });

    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Kullanıcı silinemedi' });
  }
});

// İlk admin hesabını oluştur (seed.js'de kullanılacak)
app.post('/create-first-admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // İlk admin zaten var mı kontrol et
    const existingFirstAdmin = await User.findOne({ isFirstAdmin: true });
    if (existingFirstAdmin) {
      return res.status(400).json({ message: 'İlk admin zaten oluşturulmuş' });
    }

    const firstAdmin = new User({
      username,
      password,
      role: 'admin',
      isFirstAdmin: true,
      createdBy: 'system'
    });

    await firstAdmin.save();
    res.json({ message: 'İlk admin oluşturuldu' });
  } catch (err) {
    res.status(500).json({ message: 'İlk admin oluşturulamadı' });
  }
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
