import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        Alert.alert('Başarılı', 'Kullanıcı eklendi');
        setModalVisible(false);
        setNewUser({ username: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        const error = await response.json();
        Alert.alert('Hata', error.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı eklenirken bir hata oluştu');
    }
  };

  const handleDeleteUser = async (userId, isFirstAdmin) => {
    if (isFirstAdmin) {
      Alert.alert('Hata', 'İlk admin hesabı silinemez');
      return;
    }

    Alert.alert(
      'Kullanıcı Silme',
      'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: 'admin' }), // TODO: Gerçek kullanıcı adını ekle
              });

              if (response.ok) {
                Alert.alert('Başarılı', 'Kullanıcı silindi');
                fetchUsers();
              } else {
                const error = await response.json();
                Alert.alert('Hata', error.message);
              }
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.role}>{item.role}</Text>
        {item.isFirstAdmin && (
          <Text style={styles.firstAdmin}>İlk Admin</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteUser(item._id, item.isFirstAdmin)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kullanıcı Yönetimi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.addButtonText}>Yeni Kullanıcı</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Kullanıcı Ekle</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              value={newUser.username}
              onChangeText={(text) => setNewUser({ ...newUser, username: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              secureTextEntry
              value={newUser.password}
              onChangeText={(text) => setNewUser({ ...newUser, password: text })}
            />
            
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  newUser.role === 'admin' && styles.roleButtonActive,
                ]}
                onPress={() => setNewUser({ ...newUser, role: 'admin' })}
              >
                <Text style={styles.roleButtonText}>Admin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  newUser.role === 'user' && styles.roleButtonActive,
                ]}
                onPress={() => setNewUser({ ...newUser, role: 'user' })}
              >
                <Text style={styles.roleButtonText}>Kullanıcı</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddUser}
              >
                <Text style={styles.buttonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 4,
  },
  list: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
  firstAdmin: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 