import Footer from '@/components/Footer';
import { useTheme } from '@/components/ui/Theme';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../authContext';
import Navbar from '../components/Navbar';
import SplashScreen from '../components/SplashScreen';

export default function Layout() {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

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
      <View style={[styles.page, { backgroundColor: theme.background }]}>
        <Navbar />
        <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}>
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
    paddingBottom: 120, // assez d'espace pour laisser la place au footer fixé
    flexGrow: 1, // permet au contenu de pousser le ScrollView si besoin
  },
  centerButton: {
  position: 'absolute',
  bottom: 40,           // remonte un peu au-dessus du footer
  alignSelf: 'center',  // centre horizontalement
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
    paddingTop: 28,
    paddingBottom: 5,
    borderTopWidth: 2,
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
  }
  // tes autres styles...
});

