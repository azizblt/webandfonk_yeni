import UserManagementScreen from '../screens/UserManagementScreen';

// Admin stack içinde
<Stack.Screen
  name="UserManagement"
  component={UserManagementScreen}
  options={{
    title: 'Kullanıcı Yönetimi',
    headerShown: true,
  }}
/> 