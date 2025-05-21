import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminMenuScreen = ({ navigation }) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate('UserManagement')}
    >
      <Ionicons name="people-outline" size={24} color="#007AFF" />
      <Text style={styles.menuText}>Kullanıcı Yönetimi</Text>
    </TouchableOpacity>
  );
};

const styles = {
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default AdminMenuScreen; 