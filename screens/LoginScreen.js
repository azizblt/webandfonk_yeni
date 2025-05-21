import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = 'http://192.168.1.2:3000'; // Gerçek cihaz için bilgisayarın IP adresi
// const API_URL = 'http://localhost:3000'; // iOS Simulator için

export default function LoginScreen({ navigation, setUserRole, setUsername }) {
  const [username, setUsernameState] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { darkMode, toggleTheme, colors } = useTheme();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifre giriniz.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend'den gelen role göre kullanıcı rolünü belirle
        const role = data.role || (username === 'rasit' ? 'admin' : 'user');
        setUserRole(role);
        setUsername(username);
        console.log('Giriş başarılı:', { username, role }); // Debug için

        // Giriş başarılıysa yönlendir
        if (role === 'admin') {
          navigation.replace('AdminHome', { username });
        } else {
          navigation.replace('Home', { username });
        }
      } else {
        Alert.alert('Hata', data.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      Alert.alert('Hata', 'Sunucuya bağlanırken bir hata oluştu. Lütfen backend\'in çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={darkMode ? ['#181818', '#232323'] : ['#181818', '#232323']}
      style={{ flex: 1 }}
    >
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleBtn}>
        <Text style={{ color: '#ff9800', fontWeight: 'bold' }}>
          {darkMode ? '🌙 Koyu' : '☀️ Açık'}
        </Text>
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>  
        <View style={styles.card}>
          <Text style={[styles.title, { color: '#ff9800' }]}>Stok Takip Giriş</Text>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={22} color="#ff9800" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {
                backgroundColor: '#232323',
                borderColor: '#ff9800',
                color: '#fff'
              }]}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#bbb"
              value={username}
              onChangeText={setUsernameState}
              editable={!loading}
            />
          </View>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={22} color="#ff9800" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {
                backgroundColor: '#232323',
                borderColor: '#ff9800',
                color: '#fff'
              }]}
              placeholder="Şifre"
              placeholderTextColor="#bbb"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#ff9800" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#ff9800' }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  themeToggleBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
    backgroundColor: 'rgba(255,152,0,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
  },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', letterSpacing: 1 },
  card: {
    backgroundColor: 'rgba(24,24,24,0.98)',
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
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 15,
    fontSize: 16,
    flex: 1,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 14,
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
    fontSize: 18,
    letterSpacing: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 2,
  },
});




