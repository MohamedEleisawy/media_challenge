import React, { useContext } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../authContext';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={[styles.nav, { backgroundColor: isDarkMode ? '#373737' : '#FFFFFF' }]}>
      {/* Logo */}
      <Link href="/" asChild>
        <TouchableOpacity>
          <Image
            source={require('../assets/images/contrepoint_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Link>

      {/* Icône profil */}
      <TouchableOpacity
        onPress={() => {
          if (user) {
            router.push('/profil');
          } else {
            router.push('/loginChoice');
          }
        }}
      >
        <Ionicons name="person-circle-outline" size={50} color={isDarkMode ? '#FFFFFF' : '#000000'} />
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
  },
  logo: {
    width: 130,
    height: 110,
  },
});
