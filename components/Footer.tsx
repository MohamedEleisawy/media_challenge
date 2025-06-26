import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';


export default function Footer({ styles }: { styles: any }) {
  return (
    <View style={styles.footerContainer}>
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
