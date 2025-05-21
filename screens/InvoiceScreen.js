import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

export default function InvoiceScreen() {
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const salesRes = await axios.get('http://192.168.1.2:3000/sales');
    setSales(salesRes.data.filter(sale => !sale.isInvoiced));
    const invRes = await axios.get('http://192.168.1.2:3000/invoices');
    setInvoices(invRes.data);
  };

  const handleCreateInvoice = async (saleId) => {
    await axios.post('http://192.168.1.2:3000/invoices', { saleId });
    fetchData();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Fatura Yönetimi</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Faturası Kesilmemiş Satışlar</Text>
        {sales.length === 0 && <Text style={styles.emptyText}>Faturası kesilmemiş satış yok.</Text>}
        <FlatList
          data={sales}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.productName}</Text>
              <Text>Miktar: {item.quantity} x {item.unitPrice} TL</Text>
              <Text>Alıcı: {item.buyerName}</Text>
              <Button title="Fatura Kes" onPress={() => handleCreateInvoice(item._id)} />
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Faturalar</Text>
        {invoices.length === 0 && <Text style={styles.emptyText}>Kayıtlı fatura yok.</Text>}
        <FlatList
          data={invoices}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.invoiceCard}>
              <Text style={styles.invoiceNo}>Fatura No: {item.invoiceNo}</Text>
              <Text>Ürün: {item.saleId?.productName}</Text>
              <Text>Alıcı: {item.saleId?.buyerName}</Text>
              <Text>Tutar: {item.saleId?.totalPrice} TL</Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fa', padding: 16 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 18, color: '#2a2a2a', textAlign: 'center' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1a73e8' },
  emptyText: { color: '#888', fontStyle: 'italic', marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  invoiceCard: { backgroundColor: '#e3f2fd', padding: 16, borderRadius: 10, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#1a73e8' },
  invoiceNo: { fontWeight: 'bold', color: '#1a73e8', marginBottom: 4 },
}); 