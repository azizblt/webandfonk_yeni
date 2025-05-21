import React, { useState } from 'react';
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
import InvoiceScreen from './screens/InvoiceScreen';
import InvoiceSummaryScreen from './screens/InvoiceSummaryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* Giriş & Kayıt */}
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {props => <LoginScreen {...props} setUserRole={setUserRole} setUsername={setUsername} />}
          </Stack.Screen>
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Kayıt Ol' }}
          />
          <Stack.Screen
            name="Home"
            options={{ title: 'Ana Sayfa' }}
          >
            {props => <HomeScreen {...props} username={username} userRole={userRole} />}
          </Stack.Screen>
          <Stack.Screen
            name="AdminHome"
            options={{ title: 'Admin Paneli' }}
          >
            {props => <AdminHomeScreen {...props} username={username} userRole={userRole} />}
          </Stack.Screen>
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
          <Stack.Screen
            name="Invoice"
            component={InvoiceScreen}
            options={{ title: 'Fatura Kes' }}
          />
          <Stack.Screen
            name="InvoiceSummary"
            component={InvoiceSummaryScreen}
            options={{ title: 'Fatura Özeti' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}









