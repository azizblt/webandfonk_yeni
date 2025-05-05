import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { darkMode, toggleTheme, colors } = useTheme();

  const handleLogin = () => {
    // Hard-coded test kullanıcıları
    const admin = { username: 'rasit', password: 'rasit123', role: 'admin' };
    const normalUser = { username: 'user', password: 'user123', role: 'user' };

    if (username === admin.username && password === admin.password) {
      navigation.replace('AdminHome');
    } else if (username === normalUser.username && password === normalUser.password) {
      navigation.replace('Home');
    } else {
      Alert.alert('Hatalı Giriş', 'Kullanıcı adı veya şifre yanlış.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require('../assets/muslu-logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: colors.text }]}>Stok Takip Giriş</Text>

      <TextInput
        style={[styles.input, {
          backgroundColor: colors.input,
          borderColor: colors.border,
          color: colors.text
        }]}
        placeholder="Kullanıcı Adı"
        placeholderTextColor={darkMode ? '#aaa' : '#666'}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input, {
          backgroundColor: colors.input,
          borderColor: colors.border,
          color: colors.text
        }]}
        placeholder="Şifre"
        placeholderTextColor={darkMode ? '#aaa' : '#666'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Giriş Yap" onPress={handleLogin} color={colors.primary} />

      <TouchableOpacity onPress={toggleTheme} style={styles.toggleBtn}>
        <Text style={{ color: colors.text }}>
          Tema: {darkMode ? '🌙 Koyu' : '☀️ Açık'} (Değiştir)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { width: 180, height: 90, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  toggleBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
});




