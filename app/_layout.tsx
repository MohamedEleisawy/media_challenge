// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../authContext';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import SplashScreen from '../components/SplashScreen';
import Navbar from '../components/Navbar';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font'; // 👈 Tu l'avais oublié ici

export default function Layout() {
  const [loading, setLoading] = useState(true);

  // ✅ Charger les polices correctement
  const [fontsLoaded] = useFonts({
    'GreatVibes-Regular': require('../assets/fonts/GreatVibes-Regular.ttf'),
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
  });

  // ✅ Afficher le splash screen 2 secondes
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !fontsLoaded) {
    return <SplashScreen />;
  }

  // ✅ Affichage principal de l'application
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Navbar />
        <Slot />
        <Toast /> {/* Ajout ici du composant global Toast */}
      </View>
    </AuthProvider>
  );
}
