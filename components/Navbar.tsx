import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../authContext';
import { useIsDarkMode, useTheme } from './ui/Theme';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = useIsDarkMode();

  return (
    <View style={[styles.nav, { backgroundColor: theme.navbar }]}>
      {/* Logo adaptatif selon le mode */}
      <Link href="/" asChild>
        <TouchableOpacity>
          <Image
            source={
              isDarkMode
                ? require('../assets/images/contrepointlogoblanc.png')
                : require('../assets/images/contrepoint_logo.png')
            }
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
        <Ionicons name="person-circle-outline" size={50} color={theme.text} />
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
