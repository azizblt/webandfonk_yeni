import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function ZReportScreen() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get('http://192.168.1.2:3000/z-report');
        setReport(res.data);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#4f8cff" /></View>;
  if (!report) return <View style={styles.container}><Text>Rapor alınamadı.</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Z Raporu</Text>
      <Text style={styles.section}>Haftalık Toplam: {report.week.total} TL ({report.week.invoiceCount} fatura)</Text>
      <Text style={styles.section}>Aylık Toplam: {report.month.total} TL ({report.month.invoiceCount} fatura)</Text>
      <Text style={styles.section}>En Çok Satılan Ürünler (Ay):</Text>
      {report.topProducts.length === 0 ? <Text style={styles.info}>Veri yok</Text> : report.topProducts.map(p => (
        <Text key={p.name} style={styles.info}>{p.name} - {p.qty} adet</Text>
      ))}
      <Text style={styles.section}>Stok Miktarı Azalanlar:</Text>
      {report.lowStocks.length === 0 ? <Text style={styles.info}>Yeterli stok var</Text> : report.lowStocks.map(s => (
        <Text key={s.name} style={styles.info}>{s.name} - {s.quantity} adet</Text>
      ))}
      <Text style={styles.section}>Yapay Zeka Önerileri:</Text>
      {report.suggestions.length === 0 ? <Text style={styles.info}>Öneri yok</Text> : report.suggestions.map((s, i) => (
        <Text key={i} style={styles.info}>{s}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent:'flex-start', alignItems:'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize:24, fontWeight:'bold', marginBottom:10 },
  section: { fontSize:18, fontWeight:'bold', marginTop:18, marginBottom:4 },
  info: { fontSize:16, marginBottom:2 }
});
