import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

export default function AdminScreen() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://192.168.1.2:3000/logs');
        setLogs(response.data);
      } catch (err) {
        console.error('Loglar alınamadı:', err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Girişleri</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{item.action}: {item.details}</Text>
            <Text>
              {new Date(item.createdAt).toLocaleDateString()} {' '}
              {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  logItem: { padding: 15, marginBottom: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }
});
