// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../authContext';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import SplashScreen from '../components/SplashScreen';
import Navbar from '../components/Navbar';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font'; // 👈 Tu l'avais oublié ici
import Footer from '@/components/Footer';
import { StyleSheet } from 'react-native';


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
        <Footer styles={styles} />

      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF2B2',
    paddingTop: 20,
    paddingBottom: 10,
    borderTopWidth: 2,
    borderTopColor: '#3E5F8A',
  },
  iconWrapper: {
    alignItems: 'center',
  },
  centerButton: {
    backgroundColor: '#FFF2B2',
    borderRadius: 50,
    padding: 10,
    borderWidth: 4,
    borderColor: '#3E5F8A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: -70,
  },
  aideText: {
    color: '#0A2B55',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
