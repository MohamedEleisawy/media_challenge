import { Slot } from 'expo-router';
import { AuthProvider } from '../authContext';
import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import SplashScreen from '../components/SplashScreen';
import Navbar from '../components/Navbar';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import Footer from '@/components/Footer';

export default function Layout() {
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'GreatVibes-Regular': require('../assets/fonts/GreatVibes-Regular.ttf'),
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <View style={styles.page}>
        <Navbar />
        <ScrollView contentContainerStyle={styles.content}>
          <Slot />
        </ScrollView>
        <Toast />
        <Footer styles={styles} />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative', // nécessaire pour le positionnement absolu du footer
  },
  content: {
    paddingBottom: 120, // assez d'espace pour laisser la place au footer fixé
    flexGrow: 1, // permet au contenu de pousser le ScrollView si besoin
  },
  centerButton: {
  position: 'absolute',
  bottom: 28,           // remonte un peu au-dessus du footer
  alignSelf: 'center',  // centre horizontalement
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
  zIndex: 20,
},
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF2B2',
    paddingTop: 20,
    paddingBottom: 10,
    borderTopWidth: 2,
    borderTopColor: '#3E5F8A',
    zIndex: 10,
  },
  // tes autres styles...
});

