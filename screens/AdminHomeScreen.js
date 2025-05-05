import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AdminHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Paneli</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Stok İşlemleri</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Logs')}
      >
        <Text style={styles.buttonText}>Log Girişleri</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Users')}
      >
        <Text style={styles.buttonText}>Kullanıcı Ekle/Sil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ZReport')}
      >
        <Text style={styles.buttonText}>Z Raporu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f9f9f9' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 18 }
});
