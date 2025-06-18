// components/Navbar.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../authContext'; // Ton contexte

export default function Navbar() {
  const { user } = useAuth();

  return (
    <View style={styles.nav}>
      <Link href="/" asChild>
        <Text style={styles.link}>Accueil</Text>
      </Link>
      {user ? (
        <View>
          <Link href="/profil" asChild>
            <Text style={styles.link}>Profil</Text>
          </Link>
          {/* <Button title="Déconnexion" onPress={logout} /> */}
        </View>
        
      ) : (
        <View>
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
  },
  link: {
    fontSize: 16,
    marginHorizontal: 8,
    color: 'blue',
  },
});
