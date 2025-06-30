import { Slot } from 'expo-router';
import { AuthProvider } from '../authContext';
import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import SplashScreen from '../components/SplashScreen';
import Navbar from '../components/Navbar';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import Footer from '@/components/Footer';

export default function Layout() {
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme(); // 👈 récupère le thème de l'appareil

  const isDarkMode = colorScheme === 'dark';

  const [fontsLoaded] = useFonts({
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
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
      <View style={[styles.page, { backgroundColor: isDarkMode ? '#373737' : '#fff' }]}>
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
    position: 'relative',
  },
  content: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  centerButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#00235B',
    borderRadius: 50,
    padding: 10,
    borderWidth: 4,
    borderColor: '#7595C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
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
    backgroundColor: '#00235B',
    paddingTop: 28,
    paddingBottom: 5,
    borderTopWidth: 2,
    borderTopColor: '#7595C7',
    zIndex: 10,
  },
  aideText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#fff',
    paddingBottom: 20,
  },
  home: {
    paddingBottom: 20,
  },
});
