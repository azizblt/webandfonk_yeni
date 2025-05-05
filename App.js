import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './ThemeContext'; // ✅ Tema desteği eklendi

// Ekranları import et
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AdminHomeScreen from './screens/AdminHomeScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import AdminScreen from './screens/AdminScreen';     // Log ekranı
import ZReportScreen from './screens/ZReportScreen'; // Z raporu placeholder

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Burada geçici olarak admin rolü atanıyor. Giriş sonrası gerçek kullanıcıya göre güncellenecek.
    const user = { role: 'admin' }; // 'user' yaparsan Home açılır
    setUserRole(user.role);
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* Giriş & Kayıt */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Kayıt Ol' }}
          />

          {/* Normal Kullanıcı: Sadece Home görebilir */}
          {userRole === 'user' && (
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Ana Sayfa' }}
            />
          )}

          {/* Admin: Admin ekranları görünür */}
          {userRole === 'admin' && (
            <>
              <Stack.Screen
                name="AdminHome"
                component={AdminHomeScreen}
                options={{ title: 'Admin Paneli' }}
              />
              <Stack.Screen
                name="Users"
                component={UserManagementScreen}
                options={{ title: 'Kullanıcı Yönetimi' }}
              />
              <Stack.Screen
                name="Logs"
                component={AdminScreen}
                options={{ title: 'Log Girişleri' }}
              />
              <Stack.Screen
                name="ZReport"
                component={ZReportScreen}
                options={{ title: 'Z Raporu' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}









