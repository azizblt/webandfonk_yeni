import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users');
      setUsers(res.data);
    } catch {
      Alert.alert('Hata', 'Kullanıcılar yüklenemedi');
    }
  };

  useEffect(fetchUsers, []);

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      fetchUsers();
    } catch {
      Alert.alert('Hata', 'Kullanıcı silinemedi');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Yönetimi</Text>
      <FlatList
        data={users}
        keyExtractor={i => i._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => deleteUser(item._id)}
            style={styles.item}
          >
            <Text style={styles.itemText}>{item.username} ({item.role})</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9f9f9' },
  title: { fontSize:24, fontWeight:'bold', marginBottom:20, textAlign:'center' },
  item: { padding:15, backgroundColor:'#fff', borderBottomWidth:1, borderColor:'#eee' },
  itemText: { fontSize:18 }
});
