// components/Navbar.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../authContext'; // Ton contexte
import { useFonts } from 'expo-font';
export default function Navbar() {
  const { user } = useAuth();
const [fontsLoaded] = useFonts({
    'GreatVibes-Regular': require('../assets/fonts/GreatVibes-Regular.ttf'),
    'Nunito-ExtraBoldItalic': require('../assets/fonts/Nunito-ExtraBoldItalic.ttf'),
  });
    if (!fontsLoaded) return null; // 👈 Attente du chargement des polices
  return (
    <View style={styles.nav}>
      <Link href="/" asChild>
        <Text style={styles.link}>Accueil</Text>
      </Link>
      {user ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Link href="/profil" asChild>
            <Text style={styles.link}>Profil</Text>
          </Link>
          {/* <Button title="Déconnexion" onPress={logout} /> */}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Link href="/login" asChild>
            <Text style={styles.link}>Connexion</Text>
          </Link>
          <Link href="/signup" asChild>
            <Text style={styles.link}>Inscription</Text>
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ddd',
    marginTop: 40, // Pour éviter le chevauchement avec le status bar
  },
  link: {
    fontFamily: 'GreatVibes-Regular', // Assurez-vous que ce nom est correct
    fontSize: 16,
    marginHorizontal: 8,
    color: 'blue',
  },
});
