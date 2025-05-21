import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (username && password) {
      // Bu kısmı backend'e post etmek gerekebilir, şu an basit tutuyoruz
      Alert.alert('Başarılı', 'Kayıt başarılı!');

      // Kayıttan sonra login ekranına yönlendirebiliriz
      navigation.replace('Login');
    } else {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
    }
  };

  return (
    <LinearGradient
      colors={['#e0eafc', '#cfdef3']}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Kayıt Ol</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={22} color="#333" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={22} color="#333" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    borderColor: '#ccc',
    paddingLeft: 40,
    paddingRight: 15,
    height: 50,
    marginBottom: 0,
    borderRadius: 8,
    fontSize: 16,
    flex: 1,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4f8cff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});
