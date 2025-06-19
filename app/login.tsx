import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import Toast from 'react-native-root-toast';
import { useRouter } from 'expo-router'; // Si tu utilises expo-router, sinon adapte la navigation
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Toast.show('✅ Connexion réussie !', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#4CAF50',
        textColor: 'white',
      });

      // 🔁 Redirection vers la page d’accueil
      router.replace('/'); // à adapter selon ton routeur
    } catch (error: any) {
      Toast.show(`❌ ${error.message}`, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#f44336',
        textColor: 'white',
      });
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show('📧 Entrez votre email pour réinitialiser.', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#FFA000',
        textColor: 'white',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show('🔁 Email de réinitialisation envoyé.', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#2196F3',
        textColor: 'white',
      });
    } catch (error: any) {
      Toast.show(`❌ ${error.message}`, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#f44336',
        textColor: 'white',
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    Toast.show('👋 Déconnecté avec succès.', {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: '#9E9E9E',
      textColor: 'white',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Se connecter" onPress={handleLogin} />
      
      <TouchableOpacity onPress={handleResetPassword} style={styles.link}>
        <Text style={styles.linkText}>🔁 Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.link}>
        <Text style={styles.linkText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8 },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#007bff' },
});
