import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function Footer({ styles }: { styles: any }) {
  return (
    <View style={styles.footerContainer}>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.iconWrapper}>
          <Ionicons name="home-outline" size={30} color="#fff" />
        </TouchableOpacity>
      </Link>

      <Link href="/posts" asChild>
        <TouchableOpacity style={styles.centerButton}>
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
      </Link>
      <Link href="/aide" asChild>
        <TouchableOpacity style={styles.iconWrapper}>
          <Text style={styles.aidText}>AIDE</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
