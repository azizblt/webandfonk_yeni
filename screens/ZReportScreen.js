import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ZReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Z Raporu</Text>
      <Text style={styles.info}>Bu kısım daha sonra eklenecek.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' },
  title: { fontSize:24, fontWeight:'bold', marginBottom:10 },
  info: { fontSize:16 }
});
