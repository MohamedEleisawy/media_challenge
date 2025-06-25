import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../authContext';
import { Ionicons } from '@expo/vector-icons';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.nav}>
      {/* 👇 Logo à la place de "Accueil" */}
      <Link href="/" asChild>
        <TouchableOpacity>
          <Image
            source={require('../assets/images/contrepoint_logo.png')} // Remplace par ton logo
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Link>

      {/* 👇 Icône de profil qui redirige vers /login si pas connecté */}
      <TouchableOpacity
        onPress={() => {
          if (user) {
            router.push('/profil');
          } else {
            router.push('/loginChoice');
          }
        }}
      >
        <Ionicons name="person-circle-outline" size={50} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 18,
    paddingTop: 30,
    paddingVertical: 25,
    paddingHorizontal: 40,
    backgroundColor: '#ffff',
  },
  logo: {
    width: 130,
    height: 110,

  },
});
