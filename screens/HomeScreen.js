import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Picker,
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ route, username }) {
  const { colors } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('adet');
  const [role, setRole] = useState('');
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [saleQuantity, setSaleQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerTaxNo, setBuyerTaxNo] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    if (route.params?.role) {
      setRole(route.params.role);
    }
    if (username) {
      setSellerName(username);
    }
    const fetchData = async () => {
      await fetchStocks();
    };
    fetchData();
  }, [username, route.params?.role]);

  const fetchStocks = async () => {
    try {
      const res = await axios.get('http://192.168.1.2:3000/stocks');
      setStocks(res.data);
    } catch (err) {
      Alert.alert('Hata', 'Stoklar yüklenemedi.');
    }
  };

  const addStock = async () => {
    if (!name || !quantity || !unit) {
      Alert.alert('Uyarı', 'Lütfen isim, miktar ve birim girin.');
      return;
    }
    try {
      await axios.post('http://192.168.1.2:3000/stocks', {
        name,
        quantity: Number(quantity),
        unit,
        imageUrl,
        username: sellerName
      });
      setName('');
      setQuantity('');
      setUnit('adet');
      setImageUrl('');
      fetchStocks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Stok eklenemedi.';
      Alert.alert('Hata', msg);
    }
  };

  const deleteStock = async (id) => {
    try {
      await axios.delete(`http://192.168.1.2:3000/stocks/${id}`);
      fetchStocks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Stok silinemedi.';
      Alert.alert('Hata', msg);
    }
  };

  const handleSale = async () => {
    if (!selectedStock || !saleQuantity || !unitPrice || !buyerName || !sellerName) {
      Alert.alert('Eksik Bilgi', 'Tüm alanları doldurun.');
      return;
    }
    const totalPrice = Number(saleQuantity) * Number(unitPrice);
    try {
      const response = await axios.post('http://192.168.1.2:3000/sales', {
        stockId: selectedStock._id,
        productName: selectedStock.name,
        quantity: Number(saleQuantity),
        unit: selectedStock.unit,
        unitPrice: Number(unitPrice),
        totalPrice,
        buyerName,
        buyerTaxNo,
        sellerName
      });
      setSaleModalVisible(false);
      setSaleQuantity(''); setUnitPrice(''); setBuyerName(''); setBuyerTaxNo('');
      fetchStocks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Satış kaydedilemedi.';
      Alert.alert('Hata', msg);
    }
  };

  const pickAndUploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const match = /\.([^.]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      const formData = new FormData();
      formData.append('image', { uri: localUri, name: filename, type });
      try {
        const res = await fetch('http://192.168.1.2:3000/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: formData,
        });
        const data = await res.json();
        if (data.imageUrl) setImageUrl(data.imageUrl);
      } catch (err) {
        Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setName(stock.name);
    setQuantity(stock.quantity.toString());
    setUnit(stock.unit);
    setImageUrl(stock.imageUrl || '');
    setEditModalVisible(true);
  };

  const updateStock = async () => {
    if (!name || !quantity || !unit) {
      Alert.alert('Uyarı', 'Lütfen isim, miktar ve birim girin.');
      return;
    }
    try {
      const response = await axios.put(`http://192.168.1.2:3000/stocks/${editingStock._id}`, {
        name,
        quantity: Number(quantity),
        unit,
        imageUrl,
        username: sellerName
      });
      
      if (response.data.stock) {
        setStocks(stocks.map(s => s._id === editingStock._id ? response.data.stock : s));
        setEditModalVisible(false);
        setName('');
        setQuantity('');
        setUnit('adet');
        setImageUrl('');
        setEditingStock(null);
      }
    } catch (err) {
      Alert.alert('Hata', 'Stok güncellenemedi.');
    }
  };

  return (
    <LinearGradient
      colors={colors.background === '#fff' ? ['#e0eafc', '#cfdef3'] : ['#232526', '#414345']}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}> 
        <Text style={[styles.title, { color: colors.text }]}>📦 Stok Listesi</Text>

        {/* Stok ekleme formu */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="inventory" size={22} color={colors.text} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="Ürün Adı"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.quantityUnitWrapper}>
            <View style={[styles.inputWrapper, { flex: 2 }]}>
              <MaterialIcons name="pin" size={22} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                placeholder="Miktar"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
              <MaterialIcons name="scale" size={22} color={colors.text} style={styles.inputIcon} />
              <Picker
                selectedValue={unit}
                style={[styles.picker, {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                onValueChange={(itemValue) => setUnit(itemValue)}
              >
                <Picker.Item label="Adet" value="adet" />
                <Picker.Item label="KG" value="kg" />
                <Picker.Item label="Litre" value="litre" />
                <Picker.Item label="Metre" value="metre" />
                <Picker.Item label="Paket" value="paket" />
              </Picker>
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="image" size={22} color={colors.text} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="Fotoğraf URL'si (opsiyonel)"
              placeholderTextColor="#999"
              value={imageUrl}
              onChangeText={setImageUrl}
            />
            <TouchableOpacity onPress={pickAndUploadImage} style={{ marginLeft: 8, backgroundColor: '#eee', borderRadius: 6, padding: 6 }}>
              <Text style={{ color: '#333', fontSize: 13 }}>{uploading ? 'Yükleniyor...' : 'Galeri/Kamera'}</Text>
            </TouchableOpacity>
          </View>
          <RNTouchableOpacity style={[styles.button, { backgroundColor: colors.button }]} onPress={addStock}>
            <Text style={styles.buttonText}>➕ Ekle</Text>
          </RNTouchableOpacity>
        </View>

        <FlatList
          data={stocks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RNTouchableOpacity
              onLongPress={() => {
                Alert.alert('İşlem Seçin', `${item.name} için ne yapmak istersiniz?`, [
                  { text: 'Düzenle', onPress: () => handleEdit(item) },
                  { text: 'Sil', onPress: () => deleteStock(item._id) },
                  { text: 'İptal' }
                ]);
              }}
              style={[styles.item, { backgroundColor: colors.input }]}
              activeOpacity={0.85}
            >
              <View style={styles.itemContent}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={{ width: 48, height: 48, borderRadius: 8, marginRight: 8 }} />
                ) : (
                  <MaterialIcons name="inventory" size={22} color={colors.text} style={{ marginRight: 8 }} />
                )}
                <Text style={[styles.itemText, { color: colors.text }]}> {item.name} </Text>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{item.quantity} {item.unit}</Text>
                </View>
                <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginLeft: 12 }}>
                  <MaterialIcons name="edit" size={24} color="#4f8cff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteStock(item._id)} style={{ marginLeft: 12 }}>
                  <MaterialIcons name="delete" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{margin: 10, backgroundColor: '#4f8cff', borderRadius: 8, padding: 8}} onPress={() => { setSelectedStock(item); setSaleModalVisible(true); }}>
                <Text style={{color: '#fff'}}>Satış Ekle</Text>
              </TouchableOpacity>
            </RNTouchableOpacity>
          )}
        />
      </View>
      <Modal visible={saleModalVisible} animationType="slide" transparent>
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)'}}>
          <View style={{backgroundColor:'#fff', padding:24, borderRadius:12, width:'85%'}}>
            <Text style={{fontSize:18, fontWeight:'bold', marginBottom:10}}>Satış Ekle ({selectedStock?.name})</Text>
            <TextInput placeholder="Miktar" value={saleQuantity} onChangeText={setSaleQuantity} keyboardType="numeric" style={[styles.input, {marginBottom:8}]} />
            <TextInput placeholder="Birim Fiyat" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" style={[styles.input, {marginBottom:8}]} />
            <TextInput placeholder="Alıcı Adı" value={buyerName} onChangeText={setBuyerName} style={[styles.input, {marginBottom:8}]} />
            <TextInput placeholder="Vergi No" value={buyerTaxNo} onChangeText={setBuyerTaxNo} style={[styles.input, {marginBottom:8}]} />
            <TextInput placeholder="Satış Yapan (Otomatik)" value={sellerName} editable={false} style={[styles.input, {marginBottom:8, backgroundColor:'#eee'}]} />
            <Button title="Satışı Kaydet" onPress={handleSale} />
            <Button title="İptal" color="#888" onPress={() => setSaleModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)'}}>
          <View style={{backgroundColor:'#fff', padding:24, borderRadius:12, width:'85%'}}>
            <Text style={{fontSize:18, fontWeight:'bold', marginBottom:10}}>Stok Düzenle</Text>
            <TextInput 
              placeholder="Ürün Adı" 
              value={name} 
              onChangeText={setName} 
              style={[styles.input, {marginBottom:8}]} 
            />
            <View style={styles.quantityUnitWrapper}>
              <TextInput 
                placeholder="Miktar" 
                value={quantity} 
                onChangeText={setQuantity} 
                keyboardType="numeric" 
                style={[styles.input, {flex: 2, marginBottom: 8}]} 
              />
              <Picker
                selectedValue={unit}
                style={[styles.picker, {flex: 1, marginLeft: 8}]}
                onValueChange={(itemValue) => setUnit(itemValue)}
              >
                <Picker.Item label="Adet" value="adet" />
                <Picker.Item label="KG" value="kg" />
                <Picker.Item label="Litre" value="litre" />
                <Picker.Item label="Metre" value="metre" />
                <Picker.Item label="Paket" value="paket" />
              </Picker>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
              <TextInput 
                placeholder="Fotoğraf URL'si (opsiyonel)" 
                value={imageUrl} 
                onChangeText={setImageUrl} 
                style={[styles.input, {flex: 1, marginBottom: 0}]} 
              />
              <TouchableOpacity 
                onPress={pickAndUploadImage} 
                style={{marginLeft: 8, backgroundColor: '#eee', borderRadius: 6, padding: 6}}
              >
                <Text style={{color: '#333', fontSize: 13}}>
                  {uploading ? 'Yükleniyor...' : 'Galeri/Kamera'}
                </Text>
              </TouchableOpacity>
            </View>
            <Button title="Güncelle" onPress={updateStock} />
            <Button title="İptal" color="#888" onPress={() => {
              setEditModalVisible(false);
              setName('');
              setQuantity('');
              setUnit('adet');
              setImageUrl('');
              setEditingStock(null);
            }} />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  form: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    paddingLeft: 40,
    paddingRight: 15,
    height: 48,
    borderRadius: 8,
    fontSize: 16,
    flex: 1,
    marginBottom: 0,
  },
  button: {
    marginTop: 6,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  item: {
    padding: 0,
    borderBottomWidth: 0,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemText: { fontSize: 18, flex: 1 },
  quantityBadge: {
    backgroundColor: '#4f8cff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  quantityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  quantityUnitWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  picker: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 15,
  },
});


