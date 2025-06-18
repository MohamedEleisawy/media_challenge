// app/SplashScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo_contrepoint.png')} style={{ width: 150, height: 150 }} />
      <Text style={styles.text}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 20, fontSize: 18 },
});
