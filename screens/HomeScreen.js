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
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

export default function HomeScreen({ route }) {
  const { colors } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (route.params?.role) {
      setRole(route.params.role); // 🎯 Rol bilgisi LoginScreen'den geliyor
    }
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.get('http://localhost:3000/stocks');
      setStocks(res.data);
    } catch (err) {
      Alert.alert('Hata', 'Stoklar yüklenemedi.');
    }
  };

  const addStock = async () => {
    if (!name || !quantity) {
      Alert.alert('Uyarı', 'Lütfen isim ve miktar girin.');
      return;
    }
    try {
      await axios.post('http://localhost:3000/stocks', {
        name,
        quantity: Number(quantity),
      });
      setName('');
      setQuantity('');
      fetchStocks();
    } catch (err) {
      Alert.alert('Hata', 'Stok eklenemedi.');
    }
  };

  const deleteStock = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/stocks/${id}`);
      fetchStocks();
    } catch (err) {
      Alert.alert('Hata', 'Stok silinemedi.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>📦 Stok Listesi</Text>

      {role === 'admin' && (
        <View style={styles.form}>
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
          <Button title="➕ Ekle" onPress={addStock} color={colors.button} />
        </View>
      )}

      <FlatList
        data={stocks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => {
              if (role === 'admin') {
                Alert.alert('Sil', `${item.name} kaydını silmek istiyor musun?`, [
                  { text: 'Hayır' },
                  { text: 'Evet', onPress: () => deleteStock(item._id) },
                ]);
              }
            }}
            style={[styles.item, { backgroundColor: colors.input }]}
          >
            <Text style={[styles.itemText, { color: colors.text }]}>
              {item.name} ({item.quantity})
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderRadius: 6,
    marginBottom: 5,
  },
  itemText: { fontSize: 18 },
});


