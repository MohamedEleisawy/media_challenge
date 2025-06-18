// app/_layout.tsx
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import SplashScreen from './SplashScreen';
import Navbar from '../components/Navbar'; // Ton composant nav

export default function Layout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <Slot />
    </View>
  );
}
