// app/SplashScreen.tsx
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './ui/Theme';

export default function SplashScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={require('../assets/images/splashscreen_logo.png')} style={{ width: 150, height: 150 }} />
      <Text style={[styles.text, { color: theme.text }]}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 20, fontSize: 18 },
});
