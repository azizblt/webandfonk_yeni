import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config';

const UNIT_OPTIONS = [
  { label: 'Adet', value: 'adet' },
  { label: 'KG', value: 'kg' },
  { label: 'Litre', value: 'litre' },
  { label: 'Metre', value: 'metre' },
  { label: 'Paket', value: 'paket' },
];

export default function HomeScreen() {
  const [stocks, setStocks] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('adet');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch(`${API_URL}/stocks`);
      const data = await response.json();
      setStocks(data);
    } catch (err) {
      Alert.alert('Hata', 'Stoklar yüklenemedi');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    if (!image) return '';
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
    try {
      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      Alert.alert('Hata', 'Resim yüklenemedi');
      return '';
    }
  };

  const handleAddOrUpdateStock = async () => {
    if (!name || !quantity) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }
    let uploadedImageUrl = imageUrl;
    if (image) {
      uploadedImageUrl = await uploadImage();
    }
    const stockData = {
      name,
      quantity: Number(quantity),
      unit,
      imageUrl: uploadedImageUrl,
    };
    try {
      if (editingStock) {
        // Güncelle
        await fetch(`${API_URL}/stocks/${editingStock._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockData),
        });
        Alert.alert('Başarılı', 'Stok güncellendi');
      } else {
        // Ekle
        await fetch(`${API_URL}/stocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockData),
        });
        Alert.alert('Başarılı', 'Stok eklendi');
      }
      setName('');
      setQuantity('');
      setUnit('adet');
      setImage(null);
      setImageUrl('');
      setEditingStock(null);
      setModalVisible(false);
      fetchStocks();
    } catch (err) {
      Alert.alert('Hata', 'Stok eklenemedi/güncellenemedi');
    }
  };

  const handleEditStock = (stock) => {
    setName(stock.name);
    setQuantity(stock.quantity.toString());
    setUnit(stock.unit || 'adet');
    setImageUrl(stock.imageUrl || '');
    setEditingStock(stock);
    setModalVisible(true);
  };

  const handleDeleteStock = async (id) => {
    Alert.alert('Stok Sil', 'Bu stoğu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            await fetch(`${API_URL}/stocks/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
            fetchStocks();
          } catch (err) {
            Alert.alert('Hata', 'Stok silinemedi');
          }
        }
      }
    ]);
  };

  const renderStock = ({ item }) => (
    <View style={styles.stockItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.stockImage} />
      ) : (
        <View style={[styles.stockImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#aaa' }}>Yok</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.stockName}>{item.name}</Text>
        <Text style={styles.stockDetail}>{item.quantity} {item.unit || 'adet'}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => handleEditStock(item)}>
        <Text style={{ color: '#007AFF' }}>Düzenle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteStock(item._id)}>
        <Text style={{ color: 'red' }}>Sil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stok Listesi</Text>
      <FlatList
        data={stocks}
        keyExtractor={item => item._id}
        renderItem={renderStock}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <TouchableOpacity style={styles.addBtn} onPress={() => {
        setName(''); setQuantity(''); setUnit('adet'); setImage(null); setImageUrl(''); setEditingStock(null); setModalVisible(true);
      }}>
        <Text style={styles.addBtnText}>+ Yeni Stok</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingStock ? 'Stok Güncelle' : 'Yeni Stok Ekle'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ürün Adı"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Miktar"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <Picker
              selectedValue={unit}
              style={styles.picker}
              onValueChange={(itemValue) => setUnit(itemValue)}
            >
              {UNIT_OPTIONS.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Text style={{ color: '#007AFF' }}>{image ? 'Resim Seçildi' : 'Resim Seç'}</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            )}
            <View style={styles.modalBtnRow}>
              <Button title="İptal" color="#888" onPress={() => setModalVisible(false)} />
              <Button title={editingStock ? 'Güncelle' : 'Ekle'} onPress={handleAddOrUpdateStock} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  stockImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  stockName: { fontSize: 18, fontWeight: 'bold' },
  stockDetail: { fontSize: 15, color: '#555', marginTop: 2 },
  editBtn: { marginLeft: 8, padding: 6 },
  deleteBtn: { marginLeft: 4, padding: 6 },
  addBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 4,
  },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    height: 48,
  },
  imagePickerBtn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewImage: { width: 100, height: 100, borderRadius: 8, alignSelf: 'center', marginBottom: 12 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
}); 