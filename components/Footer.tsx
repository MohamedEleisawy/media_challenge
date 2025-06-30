import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useTheme } from './ui/Theme';

export default function Footer({ styles }: { styles: any }) {
  const theme = useTheme();

  return (
    // MET MOI LE FOND SOIS DU FOOTER EN DARK MODE ET BLANC EN LIGNE AVEC LE THEME
    <View style={[styles.footerContainer, { backgroundColor: theme.footer }]}>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.iconWrapper}>
          <Ionicons name="home-outline" size={30} color="#fff" style={styles.home}/>
        </TouchableOpacity>
      </Link>

      <Link href="/postChoice" asChild>
        <TouchableOpacity style={styles.centerButton}>
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
      </Link>
      <Link href="/news" asChild>
        <TouchableOpacity style={styles.iconWrapper}>
          <Text style={styles.aideText}>NEWS</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
